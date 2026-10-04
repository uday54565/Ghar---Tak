import { useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";

const categories = [
  "All Categories",
  "Grocery",
  "Bakery",
  "Dairy",
  "Beverages",
];

const initialProducts = [
  {
    id: 1,
    name: "Basmati Rice",
    category: "Grocery",
    price: 220,
    available: true,
  },
  {
    id: 2,
    name: "Aashirvaad Atta",
    category: "Grocery",
    price: 280,
    available: true,
  },
  {
    id: 3,
    name: "Fresh Milk",
    category: "Dairy",
    price: 60,
    available: true,
  },
  {
    id: 4,
    name: "Brown Bread",
    category: "Bakery",
    price: 50,
    available: false,
  },
  {
    id: 5,
    name: "Mango Juice",
    category: "Beverages",
    price: 90,
    available: true,
  },
];

const emptyForm = {
  name: "",
  category: "Grocery",
  price: "",
  available: true,
};

function OwnerProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All Categories" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      available: product.available,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price) {
      return;
    }

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: form.name.trim(),
                category: form.category,
                price: Number(form.price),
                available: form.available,
              }
            : product
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        available: form.available,
      };

      setProducts((currentProducts) => [
        newProduct,
        ...currentProducts,
      ]);
    }

    closeModal();
  };

  const toggleAvailability = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              available: !product.available,
            }
          : product
      )
    );
  };

  const deleteProduct = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== productId
      )
    );
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-content">
          <div className="panel-header">
            <div>
              <p className="panel-label">PRODUCT MANAGEMENT</p>

              <h2>Products</h2>

              <p className="panel-description">
                Add, edit and manage the products available in
                your shop.
              </p>
            </div>

            <button
              type="button"
              className="primary-action-button"
              onClick={openAddModal}
            >
              <span>+</span>
              Add Product
            </button>
          </div>

          <div className="product-toolbar">
            <div className="product-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="dashboard-panel">
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-card-image">
                      <span>
                        {product.name.charAt(0).toUpperCase()}
                      </span>

                      <span
                        className={`product-availability ${
                          product.available
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        {product.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="product-card-content">
                      <span className="product-category">
                        {product.category}
                      </span>

                      <h3>{product.name}</h3>

                      <div className="product-card-bottom">
                        <strong>₹{product.price}</strong>

                        <label className="availability-toggle">
                          <input
                            type="checkbox"
                            checked={product.available}
                            onChange={() =>
                              toggleAvailability(product.id)
                            }
                          />

                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="product-card-actions">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(product)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="product-empty-state">
                  <div className="empty-icon">+</div>

                  <h3>No products found</h3>

                  <p>
                    Try changing your search or category filter.
                  </p>

                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    Add your first product
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="product-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="product-modal-header">
              <div>
                <p className="panel-label">
                  {editingProduct
                    ? "EDIT PRODUCT"
                    : "NEW PRODUCT"}
                </p>

                <h3>
                  {editingProduct
                    ? "Edit product"
                    : "Add product"}
                </h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="product-form-group">
                <label htmlFor="productName">
                  Product name
                </label>

                <input
                  id="productName"
                  name="name"
                  type="text"
                  placeholder="e.g. Basmati Rice"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label htmlFor="productCategory">
                    Category
                  </label>

                  <select
                    id="productCategory"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    {categories
                      .filter(
                        (category) =>
                          category !== "All Categories"
                      )
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="product-form-group">
                  <label htmlFor="productPrice">
                    Price
                  </label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      id="productPrice"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={form.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="product-form-checkbox">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      available: e.target.checked,
                    }))
                  }
                />

                <span>
                  <strong>Product is available</strong>
                  <small>
                    Customers can order this product.
                  </small>
                </span>
              </label>

              <div className="product-form-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-button"
                >
                  {editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerProducts;