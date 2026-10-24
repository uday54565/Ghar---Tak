import { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";
import { categoryApi, getErrorMessage } from "../../services/api";

const emptyForm = {
  name: "",
  description: "",
  active: true,
};

function OwnerCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCategories = async () => {
    try {
      const { data } = await categoryApi.list();
      setCategories(
        data.categories.map((category) => ({
          ...category,
          id: category._id,
          active: category.isActive,
        }))
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadCategories);
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description: category.description,
      active: category.active,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const details = {
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: form.active,
      };
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, details);
      } else {
        await categoryApi.create(details);
      }
      await loadCategories();
      closeModal();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleCategoryStatus = async (category) => {
    setError("");
    try {
      await categoryApi.update(category.id, { isActive: !category.active });
      await loadCategories();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const deleteCategory = async (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    if (!category) return;

    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    try {
      await categoryApi.remove(categoryId);
      await loadCategories();
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
          {loading && <p role="status">Loading categories...</p>}
          <div className="panel-header">
            <div>
              <p className="panel-label">CATEGORY MANAGEMENT</p>

              <h2>Categories</h2>

              <p className="panel-description">
                Organize your products into simple categories
                customers can easily browse.
              </p>
            </div>

            <button
              type="button"
              className="primary-action-button"
              onClick={openAddModal}
            >
              <span>+</span>
              Add Category
            </button>
          </div>

          <div className="category-toolbar">
            <div className="category-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-summary">
              <span>{categories.length}</span>
              categories
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="categories-grid">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <article
                    className="category-card"
                    key={category.id}
                  >
                    <div className="category-card-top">
                      <div className="category-icon">
                        {category.name.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className={`category-status ${
                          category.active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {category.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="category-card-content">
                      <h3>{category.name}</h3>

                      <p>
                        {category.description ||
                          "No description added."}
                      </p>

                      <div className="category-product-count">
                        <strong>
                          {category.productCount}
                        </strong>

                        <span>Products</span>
                      </div>
                    </div>

                    <div className="category-card-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleCategoryStatus(category)
                        }
                      >
                        {category.active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          deleteCategory(category.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="category-empty-state">
                  <div className="empty-icon">+</div>

                  <h3>No categories found</h3>

                  <p>
                    Try changing your search or add a new
                    category.
                  </p>

                  <button
                    type="button"
                    onClick={openAddModal}
                  >
                    Add Category
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="category-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="category-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="category-modal-header">
              <div>
                <p className="panel-label">
                  {editingCategory
                    ? "EDIT CATEGORY"
                    : "NEW CATEGORY"}
                </p>

                <h3>
                  {editingCategory
                    ? "Edit category"
                    : "Add category"}
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
              className="category-form"
              onSubmit={handleSubmit}
            >
              <div className="category-form-group">
                <label htmlFor="categoryName">
                  Category name
                </label>

                <input
                  id="categoryName"
                  name="name"
                  type="text"
                  placeholder="e.g. Grocery"
                  value={form.name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="category-form-group">
                <label htmlFor="categoryDescription">
                  Description
                </label>

                <textarea
                  id="categoryDescription"
                  name="description"
                  placeholder="Briefly describe this category..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  rows="4"
                />
              </div>

              <label className="category-form-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      active: e.target.checked,
                    }))
                  }
                />

                <span>
                  <strong>Category is active</strong>

                  <small>
                    Customers can browse products from
                    this category.
                  </small>
                </span>
              </label>

              <div className="category-form-actions">
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
                    : editingCategory
                    ? "Save Changes"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerCategories;