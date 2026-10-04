import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/owner/dashboard", icon: "⌂" },
  { label: "Orders", path: "/owner/orders", icon: "▣" },
  { label: "Products", path: "/owner/products", icon: "▤" },
  { label: "Categories", path: "/owner/categories", icon: "◫" },
  { label: "My Shop", path: "/owner/shop", icon: "⌂" },
  { label: "Settings", path: "/owner/settings", icon: "⚙" },
];

export default function OwnerSidebar() {
  return (
    <aside className="owner-sidebar">
      <div className="owner-brand">
        <div className="owner-brand-mark">G</div>

        <div>
          <h2>GHAR TAK</h2>
          <span>Seller Panel</span>
        </div>
      </div>

      <nav className="owner-nav">
        <p className="owner-nav-title">MAIN MENU</p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `owner-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="owner-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="owner-sidebar-bottom">
        <div className="owner-help-card">
          <div className="help-icon">?</div>

          <div>
            <strong>Need help?</strong>
            <span>Contact GHAR TAK support</span>
          </div>
        </div>

        <button className="owner-logout">
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}