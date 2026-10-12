import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/customer-dashboard.css";

const categories = [
  { name: "All", icon: "✨" },
  { name: "Grocery", icon: "🥬" },
  { name: "Fruits", icon: "🍎" },
  { name: "Dairy", icon: "🥛" },
  { name: "Bakery", icon: "🥐" },
  { name: "Snacks", icon: "🍿" },
  { name: "Beverages", icon: "🥤" },
  { name: "Personal Care", icon: "🧴" },
];

const products = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    description: "Farm fresh · 500 g",
    price: 30,
    category: "Grocery",
    emoji: "🍅",
    shop: "Sharma General Store",
    badge: "Fresh pick",
  },
  {
    id: 2,
    name: "Red Apples",
    description: "Crisp apples · 4 pcs",
    price: 120,
    category: "Fruits",
    emoji: "🍎",
    shop: "Fresh Basket",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Fresh Milk",
    description: "Full cream · 500 ml",
    price: 35,
    category: "Dairy",
    emoji: "🥛",
    shop: "Sharma General Store",
    badge: "",
  },
  {
    id: 4,
    name: "Brown Bread",
    description: "Whole wheat · 400 g",
    price: 45,
    category: "Bakery",
    emoji: "🍞",
    shop: "Daily Bake House",
    badge: "",
  },
  {
    id: 5,
    name: "Potato Chips",
    description: "Classic salted · 1 pack",
    price: 20,
    category: "Snacks",
    emoji: "🥔",
    shop: "Sharma General Store",
    badge: "Bestseller",
  },
  {
    id: 6,
    name: "Orange Juice",
    description: "Refreshing · 1 bottle",
    price: 80,
    category: "Beverages",
    emoji: "🧃",
    shop: "Fresh Basket",
    badge: "",
  },
  {
    id: 7,
    name: "Fresh Bananas",
    description: "Naturally sweet · 6 pcs",
    price: 40,
    category: "Fruits",
    emoji: "🍌",
    shop: "Fresh Basket",
    badge: "",
  },
  {
    id: 8,
    name: "Butter Cookies",
    description: "Crunchy treats · 1 pack",
    price: 55,
    category: "Bakery",
    emoji: "🍪",
    shop: "Daily Bake House",
    badge: "Popular",
  },
];

const shops = [
  {
    id: 1,
    name: "Sharma General Store",
    category: "Groceries & daily essentials",
    rating: "4.8",
    time: "15–25 min",
    emoji: "🏪",
  },
  {
    id: 2,
    name: "Fresh Basket",
    category: "Fruits & vegetables",
    rating: "4.7",
    time: "20–30 min",
    emoji: "🥦",
  },
  {
    id: 3,
    name: "Daily Bake House",
    category: "Bakery & fresh bread",
    rating: "4.9",
    time: "20–35 min",
    emoji: "🥐",
  },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ghartak-customer-cart") || "{}");
    } catch {
      return {};
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ghartak-customer-wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState("Home");
  const [showCart, setShowCart] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("ghartak-customer-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ghartak-customer-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
    setNotice("");
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
  }, [search, activeCategory]);

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

  function updateCart(productId, change) {
    setCart((currentCart) => {
      const nextQuantity = (currentCart[productId] || 0) + change;
      const nextCart = { ...currentCart };

      if (nextQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQuantity;
      }

      return nextCart;
    });

    setNotice("");
  }

  function handleNavigation(tab) {
    setActiveTab(tab);
    setNotice("");

    if (tab === "Cart") {
      setShowCart(true);
      return;
    }

    setShowCart(false);

    if (tab === "Orders") {
      setNotice("Your order history will appear here once orders are connected.");
    } else if (tab === "Profile") {
      setNotice("Customer profile and saved addresses will be available here.");
    }
  }

  function handleCheckout() {
    setShowCart(false);
    setNotice(
      "Checkout is not connected yet. We'll implement delivery addresses, order placement, and payment next."
    );
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
            onClick={() =>
              setNotice(
                "Address selection will be available when delivery addresses are implemented."
              )
            }
          >
            <span className="customer-location-pin">⌖</span>
            <span>
              <small>DELIVERING TO</small>
              <strong>Select your location⌄</strong>
            </span>
          </button>

          <button
            className="customer-account"
            onClick={() => handleNavigation("Profile")}
          >
            <span>👤</span>
            <strong>My Account</strong>
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

        {showCart ? (
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
                    <strong>Calculated at checkout</strong>
                  </div>
                  <div className="customer-summary-total">
                    <span>Item total</span>
                    <strong>₹{cartTotal}</strong>
                  </div>
                  <button
                    className="customer-primary-button customer-full-button"
                    onClick={handleCheckout}
                  >
                    Continue to checkout →
                  </button>
                  <small>Delivery charges are not included yet.</small>
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
                      <span>{product.emoji}</span>
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
        ) : activeTab === "Orders" || activeTab === "Profile" ? (
          <section className="customer-empty-state">
            <span>{activeTab === "Orders" ? "📦" : "👤"}</span>
            <h2>
              {activeTab === "Orders"
                ? "Your orders, all in one place"
                : "Your customer profile"}
            </h2>
            <p>
              {activeTab === "Orders"
                ? "Once ordering is connected, you can follow current orders and revisit previous purchases here."
                : "Your account details and delivery addresses will be available here."}
            </p>
            <button
              className="customer-primary-button"
              onClick={() => handleNavigation("Home")}
            >
              Back to shopping
            </button>
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
                        <span>{product.emoji}</span>
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
    </div>
  );
}