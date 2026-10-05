import { useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";

const initialShop = {
  name: "Sharma General Store",
  description:
    "Your local shop for groceries, daily essentials and household products.",
  category: "Grocery",
  phone: "9876543210",
  address: "Main Market, Your Village, Uttar Pradesh",
  openingTime: "08:00",
  closingTime: "21:00",
  isOpen: true,
};

function OwnerShop() {
  const [shop, setShop] = useState(initialShop);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setShop((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  };

  const toggleShopStatus = () => {
    setShop((current) => ({
      ...current,
      isOpen: !current.isOpen,
    }));

    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-content">
          <div className="panel-header">
            <div>
              <p className="panel-label">SHOP MANAGEMENT</p>

              <h2>My Shop</h2>

              <p className="panel-description">
                Manage the information customers see about your shop.
              </p>
            </div>
          </div>

          <div className="shop-management-grid">
            <form
              className="dashboard-panel shop-form-panel"
              onSubmit={handleSubmit}
            >
              <div className="shop-panel-header">
                <div>
                  <h3>Shop Information</h3>
                  <p>
                    Keep your shop details accurate and up to date.
                  </p>
                </div>

                <button
                  type="button"
                  className={`shop-status-button ${
                    shop.isOpen ? "open" : "closed"
                  }`}
                  onClick={toggleShopStatus}
                >
                  <span></span>

                  {shop.isOpen ? "Shop Open" : "Shop Closed"}
                </button>
              </div>

              <div className="shop-form">
                <div className="shop-form-group">
                  <label htmlFor="shopName">Shop name</label>

                  <input
                    id="shopName"
                    name="name"
                    type="text"
                    value={shop.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="shop-form-group">
                  <label htmlFor="shopDescription">
                    Shop description
                  </label>

                  <textarea
                    id="shopDescription"
                    name="description"
                    rows="4"
                    value={shop.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="shop-form-row">
                  <div className="shop-form-group">
                    <label htmlFor="shopCategory">
                      Shop category
                    </label>

                    <select
                      id="shopCategory"
                      name="category"
                      value={shop.category}
                      onChange={handleChange}
                    >
                      <option value="Grocery">Grocery</option>
                      <option value="Food">Food</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="General Store">
                        General Store
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="shop-form-group">
                    <label htmlFor="shopPhone">
                      Contact number
                    </label>

                    <input
                      id="shopPhone"
                      name="phone"
                      type="tel"
                      value={shop.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="shop-form-group">
                  <label htmlFor="shopAddress">
                    Shop address
                  </label>

                  <textarea
                    id="shopAddress"
                    name="address"
                    rows="3"
                    value={shop.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="shop-form-row">
                  <div className="shop-form-group">
                    <label htmlFor="openingTime">
                      Opening time
                    </label>

                    <input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      value={shop.openingTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="shop-form-group">
                    <label htmlFor="closingTime">
                      Closing time
                    </label>

                    <input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      value={shop.closingTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="shop-form-actions">
                  {saved && (
                    <span className="shop-save-message">
                      ✓ Changes saved
                    </span>
                  )}

                  <button
                    type="submit"
                    className="primary-action-button"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>

            <aside className="dashboard-panel shop-preview-panel">
              <div className="shop-preview-image">
                <span>
                  {shop.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="shop-preview-content">
                <div className="shop-preview-status">
                  <span
                    className={shop.isOpen ? "open" : "closed"}
                  ></span>

                  {shop.isOpen
                    ? "Currently Open"
                    : "Currently Closed"}
                </div>

                <h3>{shop.name}</h3>

                <span className="shop-preview-category">
                  {shop.category}
                </span>

                <p>{shop.description}</p>

                <div className="shop-preview-details">
                  <div>
                    <span className="preview-detail-label">
                      Address
                    </span>

                    <strong>{shop.address}</strong>
                  </div>

                  <div>
                    <span className="preview-detail-label">
                      Contact
                    </span>

                    <strong>{shop.phone}</strong>
                  </div>

                  <div>
                    <span className="preview-detail-label">
                      Opening hours
                    </span>

                    <strong>
                      {shop.openingTime} – {shop.closingTime}
                    </strong>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OwnerShop;