"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Import Link for the back button
import { API_BASE_URL } from "../../../config/api";

export default function ProductReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch from 'Product_Reports' database table
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/product_reports`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          console.error("Product reports data is not an array:", data);
          setReports([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product reports:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page" style={{ width: "100%" }}>
      <main className="main" style={{ width: "100%", maxWidth: "100%", padding: "20px" }}>

        {/* BACK BUTTON */}
        <div style={{ marginBottom: "20px" }}>
          <Link href="/AdminDashboard" style={{
            textDecoration: "none",
            color: "#666",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.9rem"
          }}>
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        <div className="intro" style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "3rem", color: "#4e5dbdff" }}>Product Reports</h2>
          <p style={{ marginTop: "10px", color: "#666" }}>
            Log of product updates, status changes, and inventory notes.
          </p>
        </div>

        {/* Detailed Table based on Product_Reports Schema */}
        <div style={{ width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px", overflowX: "auto" }}>
          <h3 style={{ color: "#4e5dbdff", marginBottom: "20px" }}>Report Log</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Report ID</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Product ID</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Date</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Report Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading product reports...</td></tr>
              ) : reports.length > 0 ? (
                reports.map((item) => (
                  <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                    {/* Matches Schema: reportID */}
                    <td style={{ padding: "16px", fontWeight: "bold" }}>#{item.reportID}</td>

                    {/* Matches Schema: productID */}
                    <td style={{ padding: "16px" }}>
                      <span style={{ backgroundColor: "#f3e5f5", color: "#7b1fa2", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" }}>
                        ID: {item.productID}
                      </span>
                    </td>

                    {/* Matches Schema: reportDate */}
                    <td style={{ padding: "16px" }}>
                      {item.reportDate ? new Date(item.reportDate).toLocaleDateString() : "N/A"}
                    </td>

                    {/* Matches Schema: reportDetails */}
                    <td style={{ padding: "16px", color: "#333", maxWidth: "400px" }}>
                      {item.reportDetails}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No records found in Product_Reports.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}