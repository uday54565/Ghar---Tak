import { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerHeader from "../../components/owner/OwnerHeader";
import "../../styles/owner-dashboard.css";
import { getErrorMessage, orderApi } from "../../services/api";

const statusOptions = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusClass = {
  PENDING: "status-pending",
  ACCEPTED: "status-accepted",
  PREPARING: "status-preparing",
  READY: "status-ready",
  OUT_FOR_DELIVERY: "status-out-for-delivery",
  DELIVERED: "status-delivered",
  CANCELLED: "status-cancelled",
};

function formatStatus(status) {
  return status.replaceAll("_", " ");
}

function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.forShop();
      setOrders(
        data.orders.map((order) => ({
          ...order,
          id: order._id,
          customer: order.user?.name || "Customer",
          phone: order.user?.phone || "Not provided",
          amount: order.totalPrice,
          address: order.deliveryAddress,
          status: order.orderStatus.toUpperCase(),
          date: new Date(order.createdAt).toLocaleString(),
        }))
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const updateStatus = async (orderId, newStatus) => {
    setError("");
    try {
      await orderApi.updateStatus(orderId, newStatus.toLowerCase());
      await loadOrders();
      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status: newStatus } : current
      );
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
          {loading && <p role="status">Loading orders...</p>}
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