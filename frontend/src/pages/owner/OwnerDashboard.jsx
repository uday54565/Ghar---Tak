import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";

const stats = [
  {
    title: "Today's Orders",
    value: "24",
    change: "+12.5%",
    description: "vs yesterday",
    icon: "▣",
    type: "orders",
  },
  {
    title: "Today's Sales",
    value: "₹8,420",
    change: "+8.2%",
    description: "vs yesterday",
    icon: "₹",
    type: "sales",
  },
  {
    title: "Pending Orders",
    value: "7",
    change: "Needs action",
    description: "",
    icon: "◷",
    type: "pending",
  },
  {
    title: "Total Products",
    value: "86",
    change: "+4",
    description: "this month",
    icon: "▤",
    type: "products",
  },
];

const orders = [
  {
    id: "#GT-1024",
    customer: "Rahul Kumar",
    items: "3 items",
    amount: "₹540",
    status: "Preparing",
    time: "10 min ago",
  },
  {
    id: "#GT-1023",
    customer: "Aman Singh",
    items: "2 items",
    amount: "₹320",
    status: "Pending",
    time: "18 min ago",
  },
  {
    id: "#GT-1022",
    customer: "Priya Sharma",
    items: "5 items",
    amount: "₹890",
    status: "Out for Delivery",
    time: "32 min ago",
  },
  {
    id: "#GT-1021",
    customer: "Vikas Yadav",
    items: "1 item",
    amount: "₹150",
    status: "Delivered",
    time: "45 min ago",
  },
  {
    id: "#GT-1020",
    customer: "Neha Gupta",
    items: "4 items",
    amount: "₹670",
    status: "Accepted",
    time: "1 hr ago",
  },
];

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`order-status ${statusClass}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

export default function OwnerDashboard() {
  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main">
        <OwnerHeader />

        <section className="owner-content">
          <div className="shop-status-bar">
            <div className="shop-status-info">
              <div className="shop-status-icon">✓</div>

              <div>
                <strong>Your shop is live</strong>
                <span>Customers can currently place orders from your shop.</span>
              </div>
            </div>

            <button className="manage-shop-button">
              Manage Shop →
            </button>
          </div>

          <section className="stats-grid">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.title}>
                <div className={`stat-icon ${stat.type}`}>
                  {stat.icon}
                </div>

                <div className="stat-card-top">
                  <span>{stat.title}</span>
                  <button>•••</button>
                </div>

                <div className="stat-value">{stat.value}</div>

                <div className="stat-footer">
                  <span className="stat-change">{stat.change}</span>
                  {stat.description && (
                    <span className="stat-description">
                      {stat.description}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel orders-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">ORDERS</p>
                  <h2>Recent Orders</h2>
                </div>

                <button className="view-all-button">
                  View all →
                </button>
              </div>

              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="order-id">
                            {order.id}
                          </strong>
                        </td>

                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {order.customer.charAt(0)}
                            </div>

                            <div>
                              <strong>{order.customer}</strong>
                              <span>{order.items}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>{order.amount}</strong>
                        </td>

                        <td>
                          <StatusBadge status={order.status} />
                        </td>

                        <td>
                          <span className="order-time">
                            {order.time}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dashboard-panel quick-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">QUICK ACTIONS</p>
                  <h2>Manage Store</h2>
                </div>
              </div>

              <div className="quick-actions">
                <button className="quick-action">
                  <span className="quick-action-icon">+</span>

                  <span>
                    <strong>Add Product</strong>
                    <small>Add a new item to your shop</small>
                  </span>

                  <b>→</b>
                </button>

                <button className="quick-action">
                  <span className="quick-action-icon">◫</span>

                  <span>
                    <strong>Manage Products</strong>
                    <small>Edit prices and availability</small>
                  </span>

                  <b>→</b>
                </button>

                <button className="quick-action">
                  <span className="quick-action-icon">⌂</span>

                  <span>
                    <strong>Update Shop</strong>
                    <small>Change shop information</small>
                  </span>

                  <b>→</b>
                </button>
              </div>

              <div className="store-performance">
                <div className="performance-header">
                  <div>
                    <span>Store performance</span>
                    <strong>Good</strong>
                  </div>

                  <span className="performance-score">82%</span>
                </div>

                <div className="performance-bar">
                  <div style={{ width: "82%" }} />
                </div>

                <p>
                  Keep your products updated and respond to orders quickly.
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}