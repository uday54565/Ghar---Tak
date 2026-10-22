
import { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";
import apiRequest from "../../services/api";

const categories = ["Grocery", "Bakery", "Dairy", "Beverages"];

const emptyForm = {
  name: "",
  category: "Grocery",
  price: "",
  description: "",
  isAvailable: true,
  image: "",
};

function normalizeProduct(product) {
  return {
    ...product,
    id: product._id,
    available: product.isAvailable ?? true,
    image: product.image || "",
  };
}

export default function OwnerProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load owner's products from MongoDB
  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/products/my-products");
      setProducts((data.products || []).map(normalizeProduct));
    } catch (err) {
      setError(err.message || "Products load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Clean up temporary photo preview
  useEffect(() => {
    if (!preview || !preview.startsWith("blob:")) return;

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Search and category filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = (product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All Categories" ||
        product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const availableCount = products.filter(
    (product) => product.available
  ).length;

  // Open add-product form
  function openAddModal() {
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setSelectedImage(null);
    setPreview("");
    setError("");
    setShowModal(true);
  }

  // Open edit-product form
  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      category: product.category || "Grocery",
      price: String(product.price ?? ""),
      description: product.description || "",
      isAvailable: product.available ?? true,
      image: product.image || "",
    });

    setSelectedImage(null);
    setPreview(product.image || "");
    setError("");
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm({ ...emptyForm });
    setSelectedImage(null);
    setPreview("");
    setError("");
  }

  // Handle text, select and checkbox fields
  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Select product photo and show preview
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Sirf JPG, PNG ya WEBP photo select karo.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo ka size 5 MB se kam hona chahiye.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  }

  // Upload photo to Cloudinary
  async function uploadImage() {
    if (!selectedImage) {
      return form.image;
    }

    const imageData = new FormData();
    imageData.append("image", selectedImage);

    const result = await apiRequest("/products/upload-image", {
      method: "POST",
      body: imageData,
    });

    if (!result.image) {
      throw new Error("Photo upload nahi hui. Dobara try karo.");
    }

    return result.image;
  }

  // Create or update product
  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");

    const price = Number(form.price);

    if (!form.name.trim()) {
      setError("Product ka naam enter karo.");
      return;
    }

    if (!form.category) {
      setError("Product category select karo.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Valid price enter karo.");
      return;
    }

    setSaving(true);

    try {
      const image = await uploadImage();

      const payload = {
        name: form.name.trim(),
        category: form.category,
        price,
        description: form.description.trim(),
        image: image || "",
        isAvailable: form.isAvailable,
      };

      if (editingProduct) {
        await apiRequest(`/products/${editingProduct.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm({ ...emptyForm });
      setSelectedImage(null);
      setPreview("");

      await loadProducts();
    } catch (err) {
      setError(err.message || "Product save nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  // Toggle product availability
  async function toggleAvailability(product) {
    setError("");

    try {
      await apiRequest(`/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isAvailable: !product.available,
        }),
      });

      await loadProducts();
    } catch (err) {
      setError(err.message || "Availability update nahi hui.");
    }
  }

  // Delete product
  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Kya tum "${product.name}" delete karna chahte ho?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await apiRequest(`/products/${product.id}`, {
        method: "DELETE",
      });

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch (err) {
      setError(err.message || "Product delete nahi ho paaya.");
    }
  }

  return (
    <div className="owner-dashboard">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-products">
          {/* Page heading */}
          <div className="owner-products-header">
            <div>
              <h1>My Products</h1>
              <p>Apni shop ke products yahan manage karo.</p>
            </div>

            <button
              type="button"
              className="add-product-btn"
              onClick={openAddModal}
            >
              + Add Product
            </button>
          </div>

          {error && (
            <p className="product-error" role="alert">
              {error}
            </p>
          )}

          {/* Product statistics */}
          <div className="product-stats">
            <div className="product-stat-card">
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </div>

            <div className="product-stat-card">
              <span>Available</span>
              <strong>{availableCount}</strong>
            </div>

            <div className="product-stat-card">
              <span>Unavailable</span>
              <strong>{products.length - availableCount}</strong>
            </div>
          </div>

          {/* Search and category filter */}
          <div className="product-filters">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All Categories">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Products list */}
          {loading ? (
            <p>Products load ho rahe hain...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-products">
              <p>
                {products.length === 0
                  ? "Abhi koi product add nahi hua."
                  : "Koi matching product nahi mila."}
              </p>

              {products.length === 0 && (
                <button type="button" onClick={openAddModal}>
                  + Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-card-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>
                        {(product.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="product-card-content">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p className="product-price">
                      ₹{Number(product.price).toFixed(2)}
                    </p>

                    <label className="availability-toggle">
                      <input
                        type="checkbox"
                        checked={product.available}
                        onChange={() => toggleAvailability(product)}
                      />

                      {product.available ? "Available" : "Unavailable"}
                    </label>

                    <div className="product-card-actions">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add/Edit product modal */}
      {showModal && (
        <div className="product-modal-overlay">
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-header">
              <h2 id="product-modal-title">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Product Name *
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Basmati Rice"
                  required
                />
              </label>

              <label>
                Category *
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Price (₹) *
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Product ke baare mein likho"
                  rows={3}
                />
              </label>

              <label>
                Product Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <small>JPG, PNG ya WEBP — maximum 5 MB</small>
              </label>

              {preview && (
                <div className="product-image-preview">
                  <img src={preview} alt="Product preview" />
                </div>
              )}

              <label className="availability-toggle">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleInputChange}
                />

                Product available hai
              </label>

              {error && (
                <p className="product-error" role="alert">
                  {error}
                </p>
              )}

              {/* Buttons stay at the bottom of the modal */}
              <div className="product-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
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
