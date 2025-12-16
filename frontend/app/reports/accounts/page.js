"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link"; // Import Link for the back button

export default function AccountsReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch from 'Accounts_Reports' database table
  useEffect(() => {
    fetch('http://localhost:4000/api/accounts_reports') 
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching accounts reports:", err);
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
          <h2 style={{ fontSize: "3rem", color: "#4e5dbdff" }}>Accounts Reports</h2>
          <p style={{ marginTop: "10px", color: "#666" }}>
            View financial report logs and account details.
          </p>
        </div>

        {/* Detailed Table based on Accounts_Reports Schema */}
        <div style={{ width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px", overflowX: "auto" }}>
          <h3 style={{ color: "#4e5dbdff", marginBottom: "20px" }}>Report Log</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Report ID</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Account ID</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Date</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff" }}>Report Details</th>
                  </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading financial reports...</td></tr>
                  ) : reports.length > 0 ? (
                      reports.map((item) => (
                          <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                              {/* Matches Schema: reportID */}
                              <td style={{ padding: "12px", fontWeight: "bold" }}>#{item.reportID}</td>
                              
                              {/* Matches Schema: accountID */}
                              <td style={{ padding: "12px" }}>
                                <span style={{ backgroundColor: "#e3f2fd", color: "#1565c0", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" }}>
                                    {item.accountID}
                                </span>
                              </td>
                              
                              {/* Matches Schema: reportDate */}
                              <td style={{ padding: "12px" }}>
                                {item.reportDate ? new Date(item.reportDate).toLocaleDateString() : "N/A"}
                              </td>
                              
                              {/* Matches Schema: reportDetails */}
                              <td style={{ padding: "12px", color: "#555" }}>
                                  {item.reportDetails}
                              </td>
                          </tr>
                      ))
                  ) : (
                      <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No records found in Accounts_Reports.</td></tr>
                  )}
              </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}