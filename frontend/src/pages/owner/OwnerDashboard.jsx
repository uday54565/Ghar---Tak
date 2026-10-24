import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import { getErrorMessage, orderApi, productApi, shopApi } from "../../services/api";
import "../../styles/owner-dashboard.css";

function StatusBadge({ status }) {
  const label = status.replaceAll("_", " ");
  return (
    <span className={`order-status ${label.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {label.replace(/\b\w/g, (letter) => letter.toUpperCase())}
    </span>
  );
}

export default function OwnerDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([orderApi.forShop(), productApi.mine(), shopApi.mine()])
      .then(([orderResponse, productResponse, shopResponse]) => {
        setOrders(orderResponse.data.orders);
        setProducts(productResponse.data.products);
        setShop(shopResponse.data.shop);
      })
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);

  const [today] = useState(() => new Date().toDateString());
  const todaysOrders = orders.filter(
    (order) => new Date(order.createdAt).toDateString() === today
  );
  const stats = [
    { title: "Today's Orders", value: todaysOrders.length, change: "Today", icon: "▣", type: "orders" },
    {
      title: "Today's Sales",
      value: `₹${todaysOrders.reduce((total, order) => total + order.totalPrice, 0)}`,
      change: "Today",
      icon: "₹",
      type: "sales",
    },
    {
      title: "Pending Orders",
      value: orders.filter((order) => order.orderStatus === "pending").length,
      change: "Needs action",
      icon: "◷",
      type: "pending",
    },
    { title: "Total Products", value: products.length, change: "Catalogue", icon: "▤", type: "products" },
  ];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <main className="owner-main">
        <OwnerHeader />
        <section className="owner-content">
          {error && <p className="register-error" role="alert">{error}</p>}
          <div className="shop-status-bar">
            <div className="shop-status-info">
              <div className="shop-status-icon">{shop?.isOpen ? "✓" : "!"}</div>
              <div>
                <strong>{shop?.isOpen ? "Your shop is live" : "Your shop is closed"}</strong>
                <span>
                  {shop?.isOpen
                    ? "Customers can currently place orders from your shop."
                    : "Open your shop to accept new orders."}
                </span>
              </div>
            </div>
            <Link to="/owner/shop" className="manage-shop-button">Manage Shop →</Link>
          </div>

          <section className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.title}>
                <div className={`stat-icon ${stat.type}`}>{stat.icon}</div>
                <div className="stat-card-top"><span>{stat.title}</span></div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-footer"><span className="stat-change">{stat.change}</span></div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel orders-panel">
              <div className="panel-header">
                <div><p className="panel-label">ORDERS</p><h2>Recent Orders</h2></div>
                <Link to="/owner/orders" className="view-all-button">View all →</Link>
              </div>
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr><th>ORDER</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th><th>TIME</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td><strong className="order-id">#{order._id.slice(-6).toUpperCase()}</strong></td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">{order.user?.name?.charAt(0) || "C"}</div>
                            <div><strong>{order.user?.name || "Customer"}</strong><span>{order.items.length} items</span></div>
                          </div>
                        </td>
                        <td><strong>₹{order.totalPrice}</strong></td>
                        <td><StatusBadge status={order.orderStatus} /></td>
                        <td><span className="order-time">{new Date(order.createdAt).toLocaleString()}</span></td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan="5"><div className="empty-state"><strong>No orders yet</strong><span>New customer orders will appear here.</span></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-panel quick-panel">
              <div className="panel-header"><div><p className="panel-label">QUICK ACTIONS</p><h2>Manage Store</h2></div></div>
              <div className="quick-actions">
                <Link to="/owner/products" className="quick-action">
                  <span className="quick-action-icon">+</span><span><strong>Add Product</strong><small>Add a new item to your shop</small></span><b>→</b>
                </Link>
                <Link to="/owner/products" className="quick-action">
                  <span className="quick-action-icon">◫</span><span><strong>Manage Products</strong><small>Edit prices and availability</small></span><b>→</b>
                </Link>
                <Link to="/owner/shop" className="quick-action">
                  <span className="quick-action-icon">⌂</span><span><strong>Update Shop</strong><small>Change shop information</small></span><b>→</b>
                </Link>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
