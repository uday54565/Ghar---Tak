import { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";
import { categoryApi, getErrorMessage, productApi } from "../../services/api";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  available: true,
};

function OwnerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        productApi.mine(),
        categoryApi.list(),
      ]);
      const ownerProducts = productResponse.data.products.map((product) => ({
          ...product,
          id: product._id,
          available: product.isAvailable,
          category: product.category || "",
        }));
      setProducts(ownerProducts);
      setCategories([
        ...new Set([
          ...categoryResponse.data.categories.map((category) => category.name),
          ...ownerProducts.map((product) => product.category).filter(Boolean),
        ]),
      ]);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadProducts);
  }, []);

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

  const totalProducts = products.length;

const availableProducts = products.filter((product) => product.available).length;

const unavailableProducts = totalProducts - availableProducts;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price) {
      return;
    }

    setError("");
    setSaving(true);
    try {
      const details = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        isAvailable: form.available,
      };
      if (editingProduct) {
        await productApi.update(editingProduct.id, details);
      } else {
        await productApi.create(details);
      }
      await loadProducts();
      closeModal();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (product) => {
    setError("");
    try {
      await productApi.update(product.id, { isAvailable: !product.available });
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const deleteProduct = async (productId) => {
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

    setError("");
    try {
      await productApi.remove(productId);
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-content">
          {error && <p className="register-error" role="alert">{error}</p>}
          {loading && <p role="status">Loading products...</p>}
          <div className="panel-header">
          <div className="product-summary-grid">
  <article className="product-summary-card">
    <div className="product-summary-icon total-icon">
      ▤
    </div>

    <div>
      <p>Total Products</p>
      <h3>{totalProducts}</h3>
      <span>Products in your catalogue</span>
    </div>
  </article>

  <article className="product-summary-card">
    <div className="product-summary-icon available-icon">
      ✓
    </div>

    <div>
      <p>Available Products</p>
      <h3>{availableProducts}</h3>
      <span>Ready for customers</span>
    </div>
  </article>

  <article className="product-summary-card">
    <div className="product-summary-icon unavailable-icon">
      ◷
    </div>

    <div>
      <p>Unavailable Products</p>
      <h3>{unavailableProducts}</h3>
      <span>Currently unavailable</span>
    </div>
  </article>
</div>
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
              <option value="All Categories">All Categories</option>
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
                              toggleAvailability(product)
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
                    <option value="">No category</option>
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
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
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