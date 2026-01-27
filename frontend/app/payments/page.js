"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import styles from "../AdminDashboard/dashboard.module.css";
import { API_BASE_URL } from "../../config/api";

export default function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    // Fetch stock purchases
    fetch(`${API_BASE_URL}/api/stocks`)
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch payments:", err);
        setPayments([]);
        setLoading(false);
      });

    // Fetch customer orders
    // SQL: SELECT o.order_id, o.customer_name, o.customer_email, o.total_amount, o.order_date, o.status,
    //      GROUP_CONCAT(CONCAT(oi.item_name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
    //      FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id
    //      GROUP BY o.order_id ORDER BY o.order_date DESC
    fetch(`${API_BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(data => {
        setCustomerOrders(data);
        setOrdersLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch customer orders:", err);
        setCustomerOrders([]);
        setOrdersLoading(false);
      });
  }, []);

  const totalPayment = payments.reduce((acc, item) => {
    const qty = item.Quantity || 0;
    const price = parseFloat(item.UnitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  const totalRevenue = customerOrders.reduce((acc, order) => {
    return acc + parseFloat(order.total_amount || 0);
  }, 0);

  return (
    <DashboardLayout activePage="payment">
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Payment History</h2>
      </div>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        Track stock expenditures and customer revenue.
      </p>

      {/* Total Cards */}
      <div className={styles.statsGrid} style={{ marginBottom: "32px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Stock Expenditure</div>
            <div className={styles.statValue}>${totalPayment.toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>💵</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Customer Revenue</div>
            <div className={styles.statValue}>${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff3e0' }}>📊</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Net Position</div>
            <div className={styles.statValue} style={{ color: totalRevenue - totalPayment >= 0 ? '#4caf50' : '#f44336' }}>
              ${(totalRevenue - totalPayment).toFixed(2)}
            </div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fce4ec' }}>📋</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Customer Orders</div>
            <div className={styles.statValue}>{customerOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Customer Orders Table */}
      <div className={styles.activityCard} style={{ marginBottom: "32px" }}>
        <h3 className={styles.cardTitle}>Customer Payment Records</h3>

        {ordersLoading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            Loading customer orders...
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Order ID</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Customer</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Items</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Order Date</th>
                  <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.length > 0 ? (
                  customerOrders.map((order) => (
                    <tr key={order.order_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#2c3e50", fontFamily: "monospace" }}>
                          {order.order_id}
                        </strong>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <strong style={{ fontSize: "0.95rem", color: "#2c3e50" }}>{order.customer_name}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#78909c", marginTop: "4px" }}>{order.customer_email}</div>
                      </td>
                      <td style={{ padding: "16px", color: "#546e7a", fontSize: "0.85rem" }}>
                        {order.items || "No items"}
                      </td>
                      <td style={{ padding: "16px", color: "#546e7a" }}>
                        {order.order_date ? new Date(order.order_date).toLocaleString() : "N/A"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: order.status === 'Confirmed' ? "#e8f5e9" : "#fff3e0",
                          color: order.status === 'Confirmed' ? "#2e7d32" : "#ef6c00",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "700", color: "#4caf50", fontSize: "0.95rem" }}>
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", fontSize: "0.95rem", color: "#78909c" }}>
                      No customer orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Purchase Records */}
      <div className={styles.activityCard}>
        <h3 className={styles.cardTitle}>Stock Purchase Records</h3>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            Loading payment records...
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Item Name</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Category</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Date Added</th>
                  <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Unit Price</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((item) => (
                    <tr key={item.ItemID || item._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px" }}>
                        <strong style={{ fontSize: "0.95rem", color: "#2c3e50" }}>{item.ItemName}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#78909c", marginTop: "4px" }}>Name: {item.Brand}</div>
                      </td>
                      <td style={{ padding: "16px", color: "#546e7a" }}>{item.ItemClass || item.category || "N/A"}</td>
                      <td style={{ padding: "16px", color: "#546e7a" }}>
                        {item.DateAdded ? new Date(item.DateAdded).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1565c0",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}>
                          {item.Quantity}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", color: "#546e7a" }}>
                        ${parseFloat(item.UnitPrice || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "700", color: "#4caf50", fontSize: "0.95rem" }}>
                        ${((item.Quantity || 0) * parseFloat(item.UnitPrice || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", fontSize: "0.95rem", color: "#78909c" }}>
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}