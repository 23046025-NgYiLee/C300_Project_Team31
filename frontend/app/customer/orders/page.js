"use client";
import React, { useState, useEffect } from "react";
import CustomerLayout from "../../partials/CustomerLayout";
import styles from "../../AdminDashboard/dashboard.module.css";
import { API_BASE_URL } from "../../../config/api";

export default function MyOrdersPage() {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedCustomer = JSON.parse(localStorage.getItem("customer"));
    setCustomer(loggedCustomer);

    if (loggedCustomer && loggedCustomer.email) {
      const controller = new AbortController();
      setLoading(true);

      fetch(`${API_BASE_URL}/api/orders?email=${loggedCustomer.email}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error("Orders data is not an array:", data);
            setOrders([]);
          }
          setLoading(false);
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          console.error("Error fetching customer orders:", err);
          setLoading(false);
          setOrders([]);
        });

      return () => controller.abort();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <CustomerLayout activePage="orders">
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>My Orders 📦</h2>
        <p style={{ color: '#78909c', marginTop: '8px' }}>
          Track and view your order history
        </p>
      </div>

      {/* Orders List */}
      <div className={styles.activityCard}>
        <h3 className={styles.cardTitle}>Order History</h3>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>Loading your orders...</p>
        ) : Array.isArray(orders) && orders.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Order ID</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Items / Details</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Total</th>
                  <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Tracking</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "16px" }}>
                      <strong style={{ color: "#2c3e50" }}>{order.order_id}</strong>
                    </td>
                    <td style={{ padding: "16px", color: "#546e7a" }}>
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "16px", color: "#546e7a", fontSize: "0.85rem" }}>
                      {order.items || "Order details..."}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", fontWeight: "700", color: "#4caf50" }}>
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor: order.status === "Delivered" ? "#e8f5e9" : "#fff3e0",
                        color: order.status === "Delivered" ? "#2e7d32" : "#ef6c00"
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "#546e7a", fontSize: "0.9rem" }}>
                      {order.tracking || "Not yet assigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📦</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "12px" }}>No Orders Yet</h3>
            <p style={{ color: "#78909c", marginBottom: "24px" }}>
              Start shopping to see your orders here!
            </p>
            <button
              className={styles.newRequestBtn}
              onClick={() => window.location.href = '/customer/shop'}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: "24px",
        padding: "20px",
        backgroundColor: "#f0f7ff",
        borderRadius: "12px",
        border: "1px solid #d0e7ff"
      }}>
        <h4 style={{ marginTop: 0, color: "#2c3e50" }}>📧 Email Notifications</h4>
        <p style={{ color: "#546e7a", margin: 0 }}>
          You'll receive email confirmations for all your orders with tracking information.
          Check your inbox for order updates!
        </p>
      </div>
    </CustomerLayout>
  );
}
