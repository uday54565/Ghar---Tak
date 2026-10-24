import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  cartApi,
  getErrorMessage,
  orderApi,
  productApi,
  shopApi,
  userApi,
} from "../../services/api";
import "../../styles/customer-dashboard.css";

const categoryIcons = {
  Grocery: "🥬",
  Fruits: "🍎",
  Dairy: "🥛",
  Bakery: "🥐",
  Snacks: "🍿",
  Beverages: "🥤",
};

function readStoredValue(key, fallback, isValid) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState(() =>
    readStoredValue(
      "ghartak-customer-wishlist",
      [],
      Array.isArray
    )
  );
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    readStoredValue(
      "ghartak-customer-selected-address",
      "",
      (value) => typeof value === "string"
    )
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [profileForm, setProfileForm] = useState(profile);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("ghartak-customer-selected-address", selectedAddressId);
  }, [selectedAddressId]);

  const mapCart = (serverCart) =>
    Object.fromEntries(
      (serverCart?.items || []).map((item) => [
        typeof item.product === "object" ? item.product._id : item.product,
        item.quantity,
      ])
    );

  const mapOrder = (order) => {
    const labels = {
      pending: "Confirmed",
      accepted: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return {
      id: order._id,
      placedAt: new Date(order.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      items: order.items.map(({ product, name, quantity }) => ({
        product: typeof product === "object" ? product._id : product,
        name,
        quantity,
      })),
      total: order.totalPrice,
      status: labels[order.orderStatus] || order.orderStatus,
      eta: order.orderStatus === "delivered" ? "Order completed" : "Order in progress",
      payment: "Cash on delivery",
      address: order.deliveryAddress,
    };
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [productResult, shopResult, userResult, cartResult, orderResult] =
          await Promise.all([
            productApi.list(),
            shopApi.list(),
            userApi.profile(),
            cartApi.get(),
            orderApi.mine(),
          ]);
        setProducts(
          productResult.data.products.map((product) => ({
            ...product,
            id: product._id,
            description: product.description || product.category || "Available locally",
            category: product.category || "Other",
            emoji: "🛍️",
            shop: product.shop?.shopName || "Local shop",
            badge: "",
          }))
        );
        setShops(
          shopResult.data.shops.map((shop) => ({
            ...shop,
            id: shop._id,
            name: shop.shopName,
            category: shop.category || shop.description || "Local shop",
            rating: "Local",
            time: "Local delivery",
            emoji: "🏪",
          }))
        );
        const currentUser = userResult.data.user;
        const nextProfile = {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
        };
        setProfile(nextProfile);
        setProfileForm(nextProfile);
        setAddresses(
          (currentUser.addresses || []).map((address) => ({
            id: address._id,
            label: address.label,
            details: address.details,
          }))
        );
        setWishlist((currentUser.wishlist || []).map((id) => String(id)));
        setCart(mapCart(cartResult.data.cart));
        setOrders(orderResult.data.orders.map(mapOrder));
      } catch (requestError) {
        setNotice(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const categories = [
    { name: "All", icon: "✨" },
    ...Array.from(new Set(products.map((product) => product.category))).map((name) => ({
      name,
      icon: categoryIcons[name] || "🛒",
    })),
  ];
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  ) || addresses[0];

  async function toggleWishlist(productId) {
    const nextWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    try {
      await userApi.updateProfile({ wishlist: nextWishlist });
      setWishlist(nextWishlist);
      setNotice(wishlist.includes(productId) ? "Product removed from your wishlist." : "Product saved to your wishlist.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.shop.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, activeCategory]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = products.reduce(
    (total, product) =>
      total + product.price * (cart[product.id] || 0),
    0
  );

  const cartProducts = products.filter(
    (product) => cart[product.id] > 0
  );
  const deliveryFee = cartTotal >= 499 ? 0 : 25;
  const orderTotal = cartTotal + deliveryFee;

  async function updateCart(productId, change) {
    const nextQuantity = (cart[productId] || 0) + change;
    try {
      const response =
        nextQuantity <= 0
          ? await cartApi.remove(productId)
          : cart[productId]
            ? await cartApi.update(productId, nextQuantity)
            : await cartApi.add(productId, nextQuantity);
      setCart(mapCart(response.data.cart));
      setNotice(change > 0 ? "Product added to your cart." : "Cart quantity updated.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  async function clearCart() {
    try {
      await cartApi.clear();
      setCart({});
      setNotice("Your cart has been cleared.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  function handleNavigation(tab) {
    setActiveTab(tab);
    setNotice("");
    setShowCheckout(false);
    setShowAddressForm(false);
    if (tab === "Cart") {
      setShowCart(true);
      return;
    }

    setShowCart(false);
  }

  function handleCheckout() {
    if (cartProducts.length === 0) {
      setNotice("Add at least one item to your cart before checkout.");
      return;
    }

    setShowCart(false);
    setShowCheckout(true);
    setNotice("");
  }

  async function saveAddress(event) {
    event.preventDefault();
    const details = addressDetails.trim();
    const label = addressLabel.trim();

    if (!details || !label) {
      setNotice("Enter an address label and delivery address.");
      return;
    }

    try {
      const { data } = await userApi.updateProfile({
        addresses: [...addresses, { label, details }].map(({ label: addressLabelValue, details: addressDetailsValue }) => ({
          label: addressLabelValue,
          details: addressDetailsValue,
        })),
      });
      const updatedAddresses = data.user.addresses.map((address) => ({
        id: address._id,
        label: address.label,
        details: address.details,
      }));
      setAddresses(updatedAddresses);
      setSelectedAddressId(updatedAddresses.at(-1)?.id || "");
      setAddressLabel("");
      setAddressDetails("");
      setShowAddressForm(false);
      setNotice("Your delivery address has been saved.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const nextProfile = {
      name: profileForm.name.trim(),
      email: profile.email,
      phone: profileForm.phone.trim(),
    };

    if (!nextProfile.name || !nextProfile.email) {
      setNotice("Please enter your name and email address.");
      return;
    }

    try {
      const { data } = await userApi.updateProfile({
        name: nextProfile.name,
        phone: nextProfile.phone,
      });
      setProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone });
      setProfileForm({ name: data.user.name, email: data.user.email, phone: data.user.phone });
      updateUser(data.user);
      setNotice("Your profile details have been saved.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!selectedAddress) {
      setNotice("Choose or add a delivery address before placing your order.");
      setShowLocationPicker(true);
      return;
    }

    setBusy(true);
    try {
      const { data } = await orderApi.create(selectedAddress.details);
      setOrders((current) => [mapOrder(data.order), ...current]);
      setCart({});
      setShowCheckout(false);
      setShowCart(false);
      setActiveTab("Orders");
      setNotice(`Order ${data.order._id} placed successfully.`);
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function deleteAddress(addressId) {
    const selectedAddressBeforeUpdate = addresses.find(
      (address) => address.id === selectedAddressId
    );
    const remainingAddresses = addresses.filter(
      (address) => address.id !== addressId
    );
    try {
      const { data } = await userApi.updateProfile({
        addresses: remainingAddresses.map(({ label, details }) => ({ label, details })),
      });
      const updatedAddresses = data.user.addresses.map((address) => ({
        id: address._id,
        label: address.label,
        details: address.details,
      }));
      setAddresses(updatedAddresses);
      const preferredAddress =
        selectedAddressId === addressId
          ? updatedAddresses[0]
          : updatedAddresses.find(
              (address) =>
                address.label === selectedAddressBeforeUpdate?.label &&
                address.details === selectedAddressBeforeUpdate?.details
            );
      setSelectedAddressId(preferredAddress?.id || updatedAddresses[0]?.id || "");
      setNotice("Delivery address removed.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  async function repeatOrder(order) {
    try {
      for (const item of order.items) {
        const product =
          products.find((entry) => entry.id === item.product) ||
          products.find((entry) => entry.name === item.name);
        if (product) await cartApi.add(product.id, item.quantity);
      }
      const { data } = await cartApi.get();
      setCart(mapCart(data.cart));
      setShowCheckout(false);
      setShowCart(true);
      setActiveTab("Cart");
      setNotice("Available items from this order were added to your cart.");
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  return (
    <div className="customer-app">
      <header className="customer-topbar">
        <div className="customer-topbar-inner">
          <button
            className="customer-brand"
            onClick={() => {
              setActiveTab("Home");
              setShowCart(false);
              setShowCheckout(false);
              setNotice("");
            }}
            aria-label="Go to customer home"
          >
            <span className="customer-brand-icon">G</span>
            <span>
              GHAR <strong>TAK</strong>
              <small>YOUR NEIGHBOURHOOD STORE</small>
            </span>
          </button>

          <button
            className="customer-location"
            onClick={() => setShowLocationPicker(true)}
          >
            <span className="customer-location-pin">⌖</span>
            <span>
              <small>DELIVERING TO</small>
              <strong>{selectedAddress?.label || "Add your location"}⌄</strong>
            </span>
          </button>

          <button
            className="customer-account"
            onClick={() => handleNavigation("Profile")}
          >
            <span>👤</span>
            <strong>{profile.name || "My Account"}</strong>
          </button>
          <button
            type="button"
            className="customer-account"
            onClick={() => {
              logout();
              navigate("/customer/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="customer-main">
        <section className="customer-welcome">
          <div>
            <span className="customer-eyebrow">
              YOUR LOCAL MARKETPLACE
            </span>
            <h1>
              Your neighbourhood,
              <br />
              <span>delivered to your door.</span>
            </h1>
            <p>
              Discover local shops and everyday essentials, all in one place.
            </p>
          </div>

          <div className="customer-welcome-art" aria-hidden="true">
            <div className="welcome-orbit welcome-orbit-one" />
            <div className="welcome-orbit welcome-orbit-two" />
            <span className="welcome-emoji welcome-emoji-one">🥦</span>
            <span className="welcome-emoji welcome-emoji-two">🛍️</span>
            <span className="welcome-emoji welcome-emoji-three">🍎</span>
            <span className="welcome-emoji welcome-emoji-four">🥛</span>
          </div>
        </section>

        <section className="customer-search-section">
          <div className="customer-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search products, categories or local shops..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveTab("Home");
                setShowCart(false);
                setShowCheckout(false);
              }}
              aria-label="Search products and shops"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <span className="customer-search-hint">
            SHOP LOCAL. LIVE BETTER.
          </span>
        </section>

        {notice && (
          <div className="customer-notice" role="status">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}
        {loading && <p className="customer-notice" role="status">Loading your GHAR TAK account...</p>}

        {showCheckout ? (
          <section className="customer-section customer-checkout-section">
            <div className="customer-section-heading">
              <div>
                <span className="customer-eyebrow">ALMOST THERE</span>
                <h2>Complete your order</h2>
              </div>
              <button
                className="customer-text-button"
                onClick={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
              >
                ← Back to cart
              </button>
            </div>

            <div className="customer-checkout-layout">
              <div className="customer-checkout-details">
                <section className="customer-detail-card">
                  <div className="customer-detail-heading">
                    <div>
                      <span>01</span>
                      <h3>Delivery address</h3>
                    </div>
                    <button
                      className="customer-text-button"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      Change
                    </button>
                  </div>
                  {selectedAddress ? (
                    <div className="customer-selected-address">
                      <strong>{selectedAddress.label}</strong>
                      <p>{selectedAddress.details}</p>
                    </div>
                  ) : (
                    <button
                      className="customer-add-address-button"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      + Add a delivery address
                    </button>
                  )}
                </section>

                <section className="customer-detail-card">
                  <div className="customer-detail-heading">
                    <div>
                      <span>02</span>
                      <h3>Payment method</h3>
                    </div>
                  </div>
                  <div className="customer-payment-options">
                    <div className="customer-payment-option">
                      <strong>Cash on delivery</strong>
                      <small>Pay when your order arrives</small>
                    </div>
                  </div>
                </section>

                <section className="customer-detail-card">
                  <div className="customer-detail-heading">
                    <div>
                      <span>03</span>
                      <h3>Items in your order</h3>
                    </div>
                    <span className="customer-section-caption">
                      {cartCount} items
                    </span>
                  </div>
                  <div className="customer-checkout-items">
                    {cartProducts.map((product) => (
                      <div key={product.id}>
                        <span>{product.emoji}</span>
                        <p>
                          <strong>{product.name}</strong>
                          <small>
                            {cart[product.id]} × ₹{product.price}
                          </small>
                        </p>
                        <strong>₹{product.price * cart[product.id]}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="customer-order-summary">
                <h3>Price details</h3>
                <div>
                  <span>Item total</span>
                  <strong>₹{cartTotal}</strong>
                </div>
                <div>
                  <span>Delivery fee</span>
                  <strong>{deliveryFee ? `₹${deliveryFee}` : "FREE"}</strong>
                </div>
                <div className="customer-summary-total">
                  <span>To pay</span>
                  <strong>₹{orderTotal}</strong>
                </div>
                {cartTotal < 499 && (
                  <small>Add items worth ₹{499 - cartTotal} more for free delivery.</small>
                )}
                <form onSubmit={placeOrder}>
                  <button
                    type="submit"
                    className="customer-primary-button customer-full-button"
                    disabled={cartProducts.length === 0 || busy}
                  >
                    {busy ? "Placing order..." : `Place order · ₹${orderTotal}`}
                  </button>
                </form>
                <p className="customer-demo-note">
                  Payment is collected in cash on delivery.
                </p>
              </aside>
            </div>
          </section>
        ) : showCart ? (
          <section className="customer-section customer-cart-section">
            <div className="customer-section-heading">
              <div>
                <span className="customer-eyebrow">YOUR SELECTION</span>
                <h2>Shopping cart</h2>
              </div>
              <button
                className="customer-text-button"
                onClick={() => setShowCart(false)}
              >
                ← Continue shopping
              </button>
              {cartProducts.length > 0 && (
                <button className="customer-text-button" onClick={clearCart}>
                  Clear cart
                </button>
              )}
            </div>

            {cartProducts.length === 0 ? (
              <div className="customer-empty-state">
                <span>🛒</span>
                <h3>Your cart is waiting</h3>
                <p>Add something you love from your local shops.</p>
                <button
                  className="customer-primary-button"
                  onClick={() => setShowCart(false)}
                >
                  Explore products
                </button>
              </div>
            ) : (
              <div className="customer-cart-layout">
                <div className="customer-cart-items">
                  {cartProducts.map((product) => (
                    <article
                      className="customer-cart-item"
                      key={product.id}
                    >
                      <div className="customer-product-art">
                        {product.emoji}
                      </div>
                      <div className="customer-cart-item-info">
                        <h3>{product.name}</h3>
                        <p>{product.shop}</p>
                        <strong>₹{product.price}</strong>
                      </div>
                      <div className="customer-quantity">
                        <button
                          onClick={() => updateCart(product.id, -1)}
                          aria-label={`Remove one ${product.name}`}
                        >
                          −
                        </button>
                        <span>{cart[product.id]}</span>
                        <button
                          onClick={() => updateCart(product.id, 1)}
                          aria-label={`Add one ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <aside className="customer-order-summary">
                  <h3>Order summary</h3>
                  <div>
                    <span>Subtotal</span>
                    <strong>₹{cartTotal}</strong>
                  </div>
                  <div>
                    <span>Delivery fee</span>
                    <strong>{deliveryFee ? `₹${deliveryFee}` : "FREE"}</strong>
                  </div>
                  <div className="customer-summary-total">
                    <span>Total</span>
                    <strong>₹{orderTotal}</strong>
                  </div>
                  <button
                    className="customer-primary-button customer-full-button"
                    onClick={handleCheckout}
                  >
                    Continue to checkout →
                  </button>
                  <small>
                    {deliveryFee
                      ? "Free delivery on orders of ₹499 or more."
                      : "You unlocked free delivery!"}
                  </small>
                </aside>
              </div>
            )}
          </section>
        ) : activeTab === "Wishlist" ? (
          <section className="customer-section customer-wishlist-section">
            <div className="customer-section-heading">
              <div>
                <span className="customer-eyebrow">YOUR SAVED ITEMS</span>
                <h2>My wishlist</h2>
              </div>
              <span className="customer-section-caption">{wishlistProducts.length} saved products</span>
            </div>
            {wishlistProducts.length === 0 ? (
              <div className="customer-empty-state">
                <span>♡</span>
                <h3>Your wishlist is empty</h3>
                <p>Tap the heart on any product to save it here.</p>
                <button className="customer-primary-button" onClick={() => handleNavigation("Home")}>
                  Explore products
                </button>
              </div>
            ) : (
              <div className="customer-product-grid">
                {wishlistProducts.map((product) => (
                  <article className="customer-product-card" key={product.id}>
                    <div className="customer-product-image">
                      {product.badge && <span className="customer-product-badge">{product.badge}</span>}
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span>{product.emoji}</span>
                      )}
                      <button
                        className="customer-favourite customer-favourite-active"
                        aria-label={`Remove ${product.name} from wishlist`}
                        onClick={() => toggleWishlist(product.id)}
                      >♥</button>
                    </div>
                    <div className="customer-product-details">
                      <small>{product.shop}</small>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="customer-product-bottom">
                        <strong>₹{product.price}</strong>
                        <button className="customer-add-button" onClick={() => updateCart(product.id, 1)}>
                          + Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : activeTab === "Orders" ? (
          <section className="customer-section customer-orders-section">
            <div className="customer-section-heading">
              <div>
                <span className="customer-eyebrow">YOUR GHAR TAK ACTIVITY</span>
                <h2>My orders</h2>
              </div>
              <span className="customer-section-caption">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>
            {orders.length === 0 ? (
              <div className="customer-empty-state">
                <span>📦</span>
                <h3>Your next favourite order starts here</h3>
                <p>When you place an order, you can follow its progress here.</p>
                <button
                  className="customer-primary-button"
                  onClick={() => handleNavigation("Home")}
                >
                  Explore local shops
                </button>
              </div>
            ) : (
              <div className="customer-order-list">
                {orders.map((order) => {
                  const progressSteps = [
                    "Confirmed",
                    "Preparing",
                    "On the way",
                    "Delivered",
                  ];
                  const normalizedStatus =
                    order.status === "Out for delivery"
                      ? "On the way"
                      : order.status;
                  const activeStep = Math.max(
                    0,
                    progressSteps.indexOf(normalizedStatus)
                  );

                  return (
                    <article className="customer-order-card" key={order.id}>
                      <div className="customer-order-card-header">
                        <div>
                          <span className="customer-eyebrow">
                            ORDER {order.id}
                          </span>
                          <p>Placed {order.placedAt}</p>
                        </div>
                        <span className="customer-order-status">
                          <i />
                          {order.status}
                        </span>
                      </div>
                      <div className="customer-order-card-body">
                        <div>
                          <strong>
                            {order.items
                              .map((item) => `${item.name} × ${item.quantity}`)
                              .join(", ")}
                          </strong>
                          <span>{order.payment || "Payment at checkout"}</span>
                          {order.address && <span>{order.address}</span>}
                        </div>
                        <strong className="customer-order-total">
                          ₹{order.total}
                        </strong>
                      </div>
                      <div className="customer-order-progress">
                        {progressSteps.map((step, index) => (
                          <div
                            className={
                              index <= activeStep ? "complete" : ""
                            }
                            key={step}
                          >
                            <span>{index < activeStep ? "✓" : index + 1}</span>
                            <small>{step}</small>
                          </div>
                        ))}
                      </div>
                      <div className="customer-order-card-footer">
                        <span>🚴 {order.eta || "Order completed"}</span>
                        <button
                          className="customer-text-button"
                          onClick={() => repeatOrder(order)}
                        >
                          Order again →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : activeTab === "Profile" ? (
          <section className="customer-section customer-profile-section">
            <div className="customer-section-heading">
              <div>
                <span className="customer-eyebrow">YOUR ACCOUNT</span>
                <h2>Profile & addresses</h2>
              </div>
            </div>
            <div className="customer-profile-grid">
              <form className="customer-detail-card customer-profile-form" onSubmit={saveProfile}>
                <div className="customer-detail-heading">
                  <div>
                    <span>01</span>
                    <h3>Personal details</h3>
                  </div>
                </div>
                <label>
                  Full name
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    value={profileForm.email}
                    readOnly
                  />
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Add a contact number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </label>
                <button className="customer-primary-button" type="submit">
                  Save profile
                </button>
              </form>

              <section className="customer-detail-card customer-addresses-card">
                <div className="customer-detail-heading">
                  <div>
                    <span>02</span>
                    <h3>Saved addresses</h3>
                  </div>
                  <button
                    className="customer-text-button"
                    onClick={() => setShowAddressForm((current) => !current)}
                  >
                    {showAddressForm ? "Cancel" : "+ Add address"}
                  </button>
                </div>
                {showAddressForm && (
                  <form className="customer-address-form" onSubmit={saveAddress}>
                    <label>
                      Address label
                      <input
                        value={addressLabel}
                        onChange={(event) => setAddressLabel(event.target.value)}
                        placeholder="Home, Work..."
                        required
                      />
                    </label>
                    <label>
                      Full delivery address
                      <textarea
                        value={addressDetails}
                        onChange={(event) => setAddressDetails(event.target.value)}
                        placeholder="House / flat, street, area, city and PIN code"
                        rows="3"
                        required
                      />
                    </label>
                    <button className="customer-primary-button" type="submit">
                      Save address
                    </button>
                  </form>
                )}
                {addresses.length === 0 ? (
                  <div className="customer-address-empty">
                    <p>No saved addresses yet. Add one for a quicker checkout.</p>
                  </div>
                ) : (
                  <div className="customer-address-list">
                    {addresses.map((address) => (
                      <article key={address.id}>
                        <span className="customer-address-pin">⌖</span>
                        <div>
                          <strong>
                            {address.label}
                            {selectedAddressId === address.id && (
                              <small>DEFAULT</small>
                            )}
                          </strong>
                          <p>{address.details}</p>
                        </div>
                        <div className="customer-address-actions">
                          {selectedAddressId !== address.id && (
                            <button
                              className="customer-text-button"
                              onClick={() => {
                                setSelectedAddressId(address.id);
                                setNotice(`${address.label} selected for delivery.`);
                              }}
                            >
                              Set default
                            </button>
                          )}
                          <button
                            className="customer-address-remove"
                            onClick={() => deleteAddress(address.id)}
                            aria-label={`Remove ${address.label} address`}
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </section>
        ) : (
          <>
            <section className="customer-section">
              <div className="customer-section-heading">
                <div>
                  <span className="customer-eyebrow">EXPLORE YOUR OPTIONS</span>
                  <h2>Shop by category</h2>
                </div>
                <span className="customer-section-caption">
                  Something for every day
                </span>
              </div>

              <div className="customer-category-list">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`customer-category ${
                      activeCategory === category.name
                        ? "customer-category-active"
                        : ""
                    }`}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    <span>{category.icon}</span>
                    <strong>{category.name}</strong>
                  </button>
                ))}
              </div>
            </section>

            <section className="customer-promo">
              <div>
                <span>GOOD THINGS ARE CLOSER</span>
                <h2>Discover the best of your neighbourhood.</h2>
                <p>Everyday essentials from the shops around you.</p>
                <button
                  onClick={() =>
                    document
                      .getElementById("customer-products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Start exploring <span>→</span>
                </button>
              </div>
              <div className="customer-promo-art" aria-hidden="true">
                <span>🛍️</span>
                <span>🥑</span>
                <span>🍊</span>
              </div>
            </section>

            <section className="customer-section" id="customer-products">
              <div className="customer-section-heading">
                <div>
                  <span className="customer-eyebrow">PICKED FOR EVERYDAY</span>
                  <h2>
                    {search
                      ? "Search results"
                      : activeCategory === "All"
                        ? "Popular near you"
                        : activeCategory}
                  </h2>
                </div>
                <span className="customer-section-caption">
                  {filteredProducts.length} products
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="customer-no-results">
                  <span>🔎</span>
                  <h3>No products found</h3>
                  <p>Try another search or select a different category.</p>
                  <button
                    className="customer-text-button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="customer-product-grid">
                  {filteredProducts.map((product) => (
                    <article
                      className="customer-product-card"
                      key={product.id}
                    >
                      <div className="customer-product-image">
                        {product.badge && (
                          <span className="customer-product-badge">
                            {product.badge}
                          </span>
                        )}
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <span>{product.emoji}</span>
                        )}
                        <button
                          className={`customer-favourite ${wishlist.includes(product.id) ? "customer-favourite-active" : ""}`}
                          aria-label={wishlist.includes(product.id) ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                          aria-pressed={wishlist.includes(product.id)}
                          onClick={() => toggleWishlist(product.id)}
                        >
                          {wishlist.includes(product.id) ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="customer-product-details">
                        <small>{product.shop}</small>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="customer-product-bottom">
                          <strong>₹{product.price}</strong>
                          {cart[product.id] ? (
                            <div className="customer-quantity">
                              <button
                                onClick={() => updateCart(product.id, -1)}
                                aria-label={`Remove one ${product.name}`}
                              >
                                −
                              </button>
                              <span>{cart[product.id]}</span>
                              <button
                                onClick={() => updateCart(product.id, 1)}
                                aria-label={`Add one ${product.name}`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              className="customer-add-button"
                              onClick={() => updateCart(product.id, 1)}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="customer-section">
              <div className="customer-section-heading">
                <div>
                  <span className="customer-eyebrow">MEET YOUR NEIGHBOURS</span>
                  <h2>Local shops to discover</h2>
                </div>
              </div>

              <div className="customer-shop-grid">
                {shops.map((shop) => (
                  <article className="customer-shop-card" key={shop.id}>
                    <div className="customer-shop-art">{shop.emoji}</div>
                    <div className="customer-shop-info">
                      <h3>{shop.name}</h3>
                      <p>{shop.category}</p>
                      <div className="customer-shop-meta">
                        <span>★ {shop.rating}</span>
                        <span>{shop.time}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSearch(shop.name);
                          setActiveCategory("All");
                          setActiveTab("Home");
                          setShowCart(false);
                          setShowCheckout(false);
                          document
                            .getElementById("customer-products")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Explore shop →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <nav className="customer-bottom-nav" aria-label="Customer navigation">
        <button
          className={activeTab === "Home" ? "active" : ""}
          onClick={() => handleNavigation("Home")}
        >
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button
          className={activeTab === "Categories" ? "active" : ""}
          onClick={() => {
            handleNavigation("Categories");
            document
              .getElementById("customer-products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>▦</span>
          <small>Categories</small>
        </button>

        <button
          className={activeTab === "Wishlist" ? "active" : ""}
          onClick={() => handleNavigation("Wishlist")}
        >
          <span>♡</span>
          <small>Wishlist</small>
        </button>

        <button
          className={activeTab === "Cart" ? "active" : ""}
          onClick={() => handleNavigation("Cart")}
        >
          <span className="customer-cart-icon">
            🛒
            {cartCount > 0 && (
              <b className="customer-cart-count">{cartCount}</b>
            )}
          </span>
          <small>Cart</small>
        </button>

        <button
          className={activeTab === "Orders" ? "active" : ""}
          onClick={() => handleNavigation("Orders")}
        >
          <span>▤</span>
          <small>Orders</small>
        </button>

        <button
          className={activeTab === "Profile" ? "active" : ""}
          onClick={() => handleNavigation("Profile")}
        >
          <span>♙</span>
          <small>Profile</small>
        </button>
      </nav>

      <footer className="customer-footer">
        <span>G</span>
        <strong>GHAR TAK</strong>
        <p>Your neighbourhood, delivered.</p>
      </footer>

      {showLocationPicker && (
        <div className="customer-modal-backdrop">
          <section
            className="customer-location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-location-title"
          >
            <div className="customer-detail-heading">
              <div>
                <span>⌖</span>
                <h2 id="customer-location-title">Choose delivery address</h2>
              </div>
              <button
                className="customer-modal-close"
                onClick={() => setShowLocationPicker(false)}
                aria-label="Close address selection"
              >
                ×
              </button>
            </div>
            {addresses.length === 0 && !showAddressForm && (
              <div className="customer-address-empty">
                <p>Add a delivery address to continue with checkout.</p>
              </div>
            )}
            <div className="customer-location-options">
              {addresses.map((address) => (
                <button
                  className={`customer-location-option ${
                    selectedAddressId === address.id ? "selected" : ""
                  }`}
                  key={address.id}
                  onClick={() => {
                    setSelectedAddressId(address.id);
                    setNotice(`${address.label} selected for delivery.`);
                  }}
                >
                  <span>{selectedAddressId === address.id ? "✓" : "⌖"}</span>
                  <strong>{address.label}</strong>
                  <small>{address.details}</small>
                </button>
              ))}
            </div>
            {showAddressForm && (
              <form className="customer-address-form" onSubmit={saveAddress}>
                <label>
                  Address label
                  <input
                    value={addressLabel}
                    onChange={(event) => setAddressLabel(event.target.value)}
                    placeholder="Home, Work..."
                    required
                  />
                </label>
                <label>
                  Full delivery address
                  <textarea
                    value={addressDetails}
                    onChange={(event) => setAddressDetails(event.target.value)}
                    placeholder="House / flat, street, area, city and PIN code"
                    rows="3"
                    required
                  />
                </label>
                <button className="customer-primary-button" type="submit">
                  Save address
                </button>
              </form>
            )}
            <div className="customer-location-modal-actions">
              <button
                className="customer-text-button"
                onClick={() => setShowAddressForm((current) => !current)}
              >
                {showAddressForm ? "Cancel adding address" : "+ Add a new address"}
              </button>
              <button
                className="customer-primary-button"
                onClick={() => setShowLocationPicker(false)}
                disabled={!selectedAddress}
              >
                Use this address
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}