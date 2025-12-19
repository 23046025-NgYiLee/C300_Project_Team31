"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import styles from "../AdminDashboard/dashboard.module.css";

export default function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/stocks')
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
  }, []);

  const totalPayment = payments.reduce((acc, item) => {
    const qty = item.Quantity || 0;
    const price = parseFloat(item.UnitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  return (
    <DashboardLayout activePage="payment">
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Payment History</h2>
      </div>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        Detailed expenditure report showing all stock purchases.
      </p>

      {/* Total Expenditure Card */}
      <div className={styles.statsGrid} style={{ marginBottom: "32px" }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Expenditure</div>
            <div className={styles.statValue}>${totalPayment.toFixed(2)}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>📋</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Records</div>
            <div className={styles.statValue}>{payments.length}</div>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className={styles.activityCard}>
        <h3 className={styles.cardTitle}>Payment Records</h3>

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
                        <div style={{ fontSize: "0.8rem", color: "#78909c", marginTop: "4px" }}>{item.Brand}</div>
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