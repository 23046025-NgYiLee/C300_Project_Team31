"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../partials/navbar";

export default function PaymentPage() {
  // 1. State to store database data
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from your existing API (Integration)
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

  // 3. Calculation Logic: Sum of (Quantity * Unit Price)
  const totalPayment = payments.reduce((acc, item) => {
    const qty = item.Quantity || 0;
    const price = item.UnitPrice || 0;
    return acc + (qty * price);
  }, 0);

  return (
    <>
      <Navbar />
      <div className="page">
        <main className="main">
          {/* Header Section */}
          <div className="intro">
            <h2 style={{ fontSize: "3rem", color: "#4e5dbdff" }}>Payment History</h2>
            <p style={{ marginTop: "10px", color: "#666" }}>
              Calculation of total inventory expenditure based on stock records.
            </p>
          </div>

          <div style={{ width: "100%", maxWidth: "900px", marginTop: "20px" }}>
            
            {/* Total Calculation Display (Operational Efficiency) */}
            <div style={{ 
                marginBottom: "24px", 
                padding: "20px", 
                backgroundColor: "#f4f4f9", 
                borderLeft: "5px solid #4e5dbdff",
                borderRadius: "4px", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div>
                  <h3 style={{ margin: 0, color: "#333" }}>Total Expenditure</h3>
                  <small style={{ color: "#666" }}>Accumulated value of all stocks</small>
                </div>
                <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#4e5dbdff" }}>
                    ${totalPayment.toFixed(2)}
                </span>
            </div>

            {/* The Payment Table (Transparency) */}
            <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "16px" }}>
              {loading ? (
                <p style={{ textAlign: "center", padding: "20px" }}>Loading payment records...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #4e5dbdff" }}>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Item Name</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Date Added</th>
                      <th style={{ textAlign: "center", padding: "12px", color: "#4e5dbdff" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "12px", color: "#4e5dbdff" }}>Unit Price</th>
                      <th style={{ textAlign: "right", padding: "12px", color: "#4e5dbdff" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((item) => (
                        <tr key={item.ItemID || item._id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "12px" }}>
                            <strong>{item.ItemName}</strong><br/>
                            <span style={{fontSize: "0.85rem", color: "#777"}}>{item.Brand} - {item.ItemClass}</span>
                          </td>
                          <td style={{ padding: "12px" }}>
                             {/* Format date if it exists, otherwise show placeholder */}
                             {item.DateAdded ? new Date(item.DateAdded).toLocaleDateString() : "N/A"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{item.Quantity}</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            ${Number(item.UnitPrice || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#333" }}>
                            ${( (item.Quantity || 0) * (item.UnitPrice || 0) ).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>
                          No payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}