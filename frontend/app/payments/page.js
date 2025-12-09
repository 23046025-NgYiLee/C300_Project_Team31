"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../partials/navbar";

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
    const price = item.UnitPrice || 0;
    return acc + (qty * price);
  }, 0);

  return (
    <>
      <Navbar />
      <div className="page" style={{ width: "100%" }}> {/* Ensure parent is wide */}
        <main className="main" style={{ width: "100%", maxWidth: "100%", padding: "20px" }}> {/* Allow Main to be full width */}
          
          <div className="intro">
            <h2 style={{ fontSize: "3rem", color: "#4e5dbdff" }}>Payment History</h2>
            <p style={{ marginTop: "10px", color: "#666" }}>
              Detailed expenditure report.
            </p>
          </div>

          {/* CHANGE MADE HERE: 
             Changed maxWidth from '900px' to '100%' 
             Added paddingRight to prevent it from hitting the scrollbar
          */}
          <div style={{ width: "100%", marginTop: "20px", paddingRight: "20px" }}>
            
            {/* Total Display */}
            <div style={{ 
                marginBottom: "24px", 
                padding: "20px", 
                backgroundColor: "#f4f4f9", 
                borderLeft: "5px solid #4e5dbdff",
                borderRadius: "4px", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                width: "100%" // Force full width
            }}>
                <div>
                  <h3 style={{ margin: 0, color: "#333" }}>Total Expenditure</h3>
                  <small style={{ color: "#666" }}>Accumulated value of all stocks</small>
                </div>
                <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#4e5dbdff" }}>
                    ${totalPayment.toFixed(2)}
                </span>
            </div>

            {/* Table Container - Full Width */}
            <div style={{ 
                overflowX: "auto", 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "16px",
                backgroundColor: "white",
                width: "100%" // Force full width
            }}>
              {loading ? (
                <p style={{ textAlign: "center", padding: "20px" }}>Loading payment records...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #4e5dbdff", backgroundColor: "#f8f9fa" }}>
                      {/* Added width percentages to distribute space evenly in landscape */}
                      <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff", width: "30%" }}>Item Name</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff", width: "15%" }}>Category</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff", width: "15%" }}>Date Added</th>
                      <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff", width: "10%" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "16px", color: "#4e5dbdff", width: "15%" }}>Unit Price</th>
                      <th style={{ textAlign: "right", padding: "16px", color: "#4e5dbdff", width: "15%" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((item) => (
                        <tr key={item.ItemID || item._id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "16px" }}>
                            <strong style={{ fontSize: "1.1rem" }}>{item.ItemName}</strong>
                            <div style={{ fontSize: "0.85rem", color: "#777", marginTop: "4px" }}>{item.Brand}</div>
                          </td>
                          <td style={{ padding: "16px" }}>{item.ItemClass || item.category || "N/A"}</td>
                          <td style={{ padding: "16px" }}>
                             {item.DateAdded ? new Date(item.DateAdded).toLocaleDateString() : "N/A"}
                          </td>
                          <td style={{ padding: "16px", textAlign: "center" }}>
                            <span style={{ 
                                backgroundColor: "#e3f2fd", 
                                color: "#4e5dbdff", 
                                padding: "4px 12px", 
                                borderRadius: "12px",
                                fontWeight: "bold"
                            }}>
                                {item.Quantity}
                            </span>
                          </td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            ${Number(item.UnitPrice || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: "16px", textAlign: "right", fontWeight: "bold", color: "#333", fontSize: "1.1rem" }}>
                            ${( (item.Quantity || 0) * (item.UnitPrice || 0) ).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: "30px", textAlign: "center", fontSize: "1.2rem", color: "#888" }}>
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