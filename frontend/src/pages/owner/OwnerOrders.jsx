import { useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";

const initialOrders = [
  {
    id: "#GT-1024",
    customer: "Rahul Kumar",
    phone: "9876543210",
    items: [
      { name: "Basmati Rice", quantity: 2, price: 220 },
      { name: "Cooking Oil", quantity: 1, price: 100 },
    ],
    amount: 540,
    address: "Dadri, Uttar Pradesh",
    status: "PREPARING",
    date: "Today, 10:42 AM",
  },
  {
    id: "#GT-1023",
    customer: "Aman Singh",
    phone: "9876501234",
    items: [
      { name: "Milk", quantity: 2, price: 60 },
      { name: "Bread", quantity: 1, price: 50 },
    ],
    amount: 320,
    address: "Dadri, Uttar Pradesh",
    status: "PENDING",
    date: "Today, 10:25 AM",
  },
  {
    id: "#GT-1022",
    customer: "Priya Sharma",
    phone: "9876512345",
    items: [
      { name: "Atta", quantity: 2, price: 180 },
      { name: "Sugar", quantity: 1, price: 50 },
      { name: "Tea", quantity: 1, price: 180 },
    ],
    amount: 890,
    address: "Dadri, Uttar Pradesh",
    status: "OUT_FOR_DELIVERY",
    date: "Today, 09:50 AM",
  },
  {
    id: "#GT-1021",
    customer: "Neha Verma",
    phone: "9876523456",
    items: [
      { name: "Biscuits", quantity: 3, price: 40 },
      { name: "Juice", quantity: 2, price: 80 },
    ],
    amount: 280,
    address: "Dadri, Uttar Pradesh",
    status: "DELIVERED",
    date: "Yesterday, 07:30 PM",
  },
];

const statusOptions = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusClass = {
  PENDING: "status-pending",
  ACCEPTED: "status-accepted",
  PREPARING: "status-preparing",
  READY: "status-ready",
  OUT_FOR_DELIVERY: "status-out-for-delivery",
  DELIVERED: "status-delivered",
};

function formatStatus(status) {
  return status.replaceAll("_", " ");
}

function OwnerOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const updateStatus = (orderId, newStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );

    setSelectedOrder((currentOrder) =>
      currentOrder?.id === orderId
        ? { ...currentOrder, status: newStatus }
        : currentOrder
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
              <p className="panel-label">ORDER MANAGEMENT</p>
              <h2>Orders</h2>
              <p className="panel-description">
                Manage incoming orders and update their delivery status.
              </p>
            </div>

            <div className="panel-header-actions">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">All Orders</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="order-id">{order.id}</strong>
                          <span className="order-date">
                            {order.date}
                          </span>
                        </td>

                        <td>
                          <strong>{order.customer}</strong>
                          <span>{order.address}</span>
                        </td>

                        <td>{order.items.length}</td>

                        <td>
                          <strong>₹{order.amount}</strong>
                        </td>

                        <td>
                          <select
                            className={`order-status-select ${
                              statusClass[order.status]
                            }`}
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(
                                order.id,
                                e.target.value
                              )
                            }
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <strong>No orders found</strong>
                          <span>
                            There are no orders with this status.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <p className="panel-label">ORDER DETAILS</p>
                <h3>{selectedOrder.id}</h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="order-detail-section">
              <div className="order-detail-row">
                <span>Customer</span>
                <strong>{selectedOrder.customer}</strong>
              </div>

              <div className="order-detail-row">
                <span>Phone</span>
                <strong>{selectedOrder.phone}</strong>
              </div>

              <div className="order-detail-row">
                <span>Address</span>
                <strong>{selectedOrder.address}</strong>
              </div>

              <div className="order-detail-row">
                <span>Status</span>

                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateStatus(
                      selectedOrder.id,
                      e.target.value
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="order-items-section">
              <h4>Ordered Items</h4>

              {selectedOrder.items.map((item, index) => (
                <div
                  className="order-item"
                  key={`${item.name}-${index}`}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × ₹{item.price}
                    </span>
                  </div>

                  <strong>
                    ₹{item.quantity * item.price}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total Amount</span>
              <strong>₹{selectedOrder.amount}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerOrders;