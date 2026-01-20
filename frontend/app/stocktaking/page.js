"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// 1. Import your Layout and Styles to match StockList
import DashboardLayout from "../partials/DashboardLayout";
import dashboardStyles from "../AdminDashboard/dashboard.module.css";

export default function StockTakingPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [physicalCounts, setPhysicalCounts] = useState({});

  // Fetch current System Stock
  useEffect(() => {
    fetch('http://localhost:4000/api/stocks')
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stocks:", err);
        setLoading(false);
      });
  }, []);

  // Handle Input Change
  const handleCountChange = (itemId, value) => {
    setPhysicalCounts(prev => ({
      ...prev,
      [itemId]: parseInt(value) || 0
    }));
  };

  // Helper: Calculate Discrepancy Count
  const discrepancyCount = stocks.reduce((count, item) => {
    const systemQty = item.Quantity || 0;
    const physicalQty = physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : systemQty;
    return (physicalQty - systemQty) !== 0 ? count + 1 : count;
  }, 0);

  // Submit Adjustments
  const handleFinalize = async () => {
    const adjustments = [];
    stocks.forEach(item => {
      const actual = physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : item.Quantity;
      if (actual !== item.Quantity) {
        adjustments.push({
          ItemID: item.ItemID,
          ItemName: item.ItemName,
          OldQuantity: item.Quantity,
          NewQuantity: actual,
          Variance: actual - item.Quantity
        });
      }
    });

    if (adjustments.length === 0) {
      alert("No discrepancies found. All stock matches!");
      return;
    }

    const confirmMsg = `You are about to adjust ${adjustments.length} items:\n\n` +
      adjustments.map(a => `- ${a.ItemName}: ${a.OldQuantity} -> ${a.NewQuantity}`).join("\n");

    if (window.confirm(confirmMsg)) {
      // Add your API PUT/PATCH logic here
      alert("Stock levels updated successfully!");
      window.location.reload();
    }
  };

  return (
    // 2. Wrap in DashboardLayout. We use a new activePage key "stocktaking"
    <DashboardLayout activePage="stocktaking">

      {/* --- ADDED: Go Back to Stock List Button --- */}
      <div style={{ marginBottom: "20px" }}>
        <Link href="/stocklist" style={{
          textDecoration: "none",
          color: "#666",
          fontWeight: "bold",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "0.9rem",
          padding: "8px 12px",
          backgroundColor: "white",
          borderRadius: "6px",
          border: "1px solid #ddd",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <span>←</span> Back to Stock List
        </Link>
      </div>
      {/* ------------------------------------------- */}

      {/* Page Header (Matching StockList style) */}
      <div className={dashboardStyles.pageHeader}>
        <div>
          <h2 className={dashboardStyles.pageTitle}>Stock Taking</h2>
          <p style={{ color: "#666", marginTop: "5px" }}>Reconcile physical inventory with system records.</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              // Generate stock-taking report
              const discrepancies = stocks.filter(item => {
                const systemQty = item.Quantity || 0;
                const physicalQty = physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : systemQty;
                return (physicalQty - systemQty) !== 0;
              });

              // Create CSV report
              const headers = ['Item Name', 'Category', 'System Qty', 'Physical Count', 'Variance', 'Status'].join(',');
              const rows = stocks.map(item => {
                const systemQty = item.Quantity || 0;
                const physicalQty = physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : systemQty;
                const variance = physicalQty - systemQty;
                const status = variance === 0 ? 'Matched' : 'Differs';

                return [
                  `"${item.ItemName}"`,
                  `"${item.ItemCategory || item.Category || ''}"`,
                  systemQty,
                  physicalQty,
                  variance > 0 ? `+${variance}` : variance,
                  status
                ].join(',');
              });

              const csv = [headers, ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `stock_taking_report_${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
            className={dashboardStyles.newRequestBtn}
            style={{ backgroundColor: "#27ae60", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>📊</span> Generate Report
          </button>
          <button
            onClick={handleFinalize}
            className={dashboardStyles.newRequestBtn}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span>✅</span> Confirm Updates
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS (Placed above table) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderLeft: "4px solid #4e5dbdff" }}>
          <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Total Items</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#333" }}>{stocks.length}</div>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", borderLeft: "4px solid #f39c12" }}>
          <div style={{ color: "#888", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>Discrepancies</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: discrepancyCount > 0 ? "#e67e22" : "#2ecc71" }}>
            {discrepancyCount}
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div style={{ width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
              <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Item Name</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Category</th>
              <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff" }}>System Qty</th>
              <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff", backgroundColor: "#eef2ff" }}>Physical Count</th>
              <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff" }}>Variance</th>
              <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#888" }}>Loading inventory data...</td></tr>
            ) : stocks.length > 0 ? (
              stocks.map((item) => {
                const systemQty = item.Quantity || 0;
                const physicalQty = physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : systemQty;
                const variance = physicalQty - systemQty;
                const hasVariance = variance !== 0;

                return (
                  <tr key={item.ItemID} style={{ borderBottom: "1px solid #f1f1f1", backgroundColor: hasVariance ? "#fffbf2" : "white" }}>
                    <td style={{ padding: "16px", fontWeight: "bold" }}>{item.ItemName}</td>
                    <td style={{ padding: "16px" }}>{item.ItemCategory || item.Category}</td>

                    {/* System Qty */}
                    <td style={{ padding: "16px", textAlign: "center", color: "#888" }}>
                      {systemQty}
                    </td>

                    {/* INPUT FIELD */}
                    <td style={{ padding: "12px", textAlign: "center", backgroundColor: hasVariance ? "#fffbf2" : "#f8f9fa" }}>
                      <input
                        type="number"
                        value={physicalCounts[item.ItemID] !== undefined ? physicalCounts[item.ItemID] : systemQty}
                        onChange={(e) => handleCountChange(item.ItemID, e.target.value)}
                        style={{
                          width: "80px",
                          padding: "8px",
                          textAlign: "center",
                          border: hasVariance ? "2px solid #f39c12" : "1px solid #ddd",
                          borderRadius: "6px",
                          fontWeight: "bold",
                          color: hasVariance ? "#d35400" : "#2c3e50",
                          outline: "none",
                          backgroundColor: "#ffffff"
                        }}
                      />
                    </td>

                    {/* Variance */}
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span style={{
                        fontWeight: "bold",
                        color: variance === 0 ? "#ccc" : (variance < 0 ? "#e74c3c" : "#27ae60")
                      }}>
                        {variance > 0 ? `+${variance}` : variance}
                      </span>
                    </td>

                    {/* Status Badges */}
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      {variance === 0 ? (
                        <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>
                          Matched
                        </span>
                      ) : (
                        <span style={{ backgroundColor: "#fff3e0", color: "#e67e22", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>
                          Differs
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#888" }}>No items found to count.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}