"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import styles from "../AdminDashboard/dashboard.module.css";
import { API_BASE_URL } from "../../config/api";

export default function ProductReferencesPage() {
  const [activeTab, setActiveTab] = useState("brands");
  const [brands, setBrands] = useState([]);
  const [classes, setClasses] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [brandsRes, classesRes, typesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/brands`),
        fetch(`${API_BASE_URL}/api/classes`),
        fetch(`${API_BASE_URL}/api/types`)
      ]);

      setBrands(await brandsRes.json());
      setClasses(await classesRes.json());
      setTypes(await typesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load product reference data");
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setModalMode("add");
    setFormData({ name: "", description: "" });
    setCurrentItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setCurrentItem(item);
    setFormData({
      name: item.BrandName || item.ClassName || item.TypeName,
      description: item.Description || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === "brands" ? "/api/brands" :
      activeTab === "classes" ? "/api/classes" : "/api/types";
    const nameField = activeTab === "brands" ? "BrandName" :
      activeTab === "classes" ? "ClassName" : "TypeName";

    try {
      const url = modalMode === "add" ?
        `${API_BASE_URL}${endpoint}` :
        `${API_BASE_URL}${endpoint}/${currentItem.BrandID || currentItem.ClassID || currentItem.TypeID}`;

      const response = await fetch(url, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [nameField]: formData.name,
          Description: formData.description
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Operation failed");
      }

      alert(`✓ ${activeTab.slice(0, -1)} ${modalMode === "add" ? "created" : "updated"} successfully!`);
      setShowModal(false);
      fetchAllData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (item) => {
    const name = item.BrandName || item.ClassName || item.TypeName;
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const endpoint = activeTab === "brands" ? "/api/brands" :
      activeTab === "classes" ? "/api/classes" : "/api/types";
    const id = item.BrandID || item.ClassID || item.TypeID;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Delete failed");
      }

      alert(`✓ ${activeTab.slice(0, -1)} deleted successfully!`);
      fetchAllData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const getCurrentData = () => {
    if (activeTab === "brands") return brands;
    if (activeTab === "classes") return classes;
    return types;
  };

  const getItemName = (item) => {
    return item.BrandName || item.ClassName || item.TypeName;
  };

  return (
    <DashboardLayout activePage="products">
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>📦 Product Information Tables</h2>
        <p style={{ color: "#666", marginTop: "8px" }}>
          Manage product reference data: Brands, Classes, and Types in separate normalized tables
        </p>
      </div>

      {/* Info Banner */}
      <div style={{
        backgroundColor: "#e3f2fd",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
        borderLeft: "4px solid #2196f3"
      }}>
        <p style={{ margin: 0, color: "#1565c0", fontSize: "0.9rem" }}>
          <strong>ℹ️ Product Information Tables:</strong> Product names, classes, and types are now stored in separate reference tables for better data integrity and management.
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid} style={{ marginBottom: "30px" }}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>🏷️</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Names</div>
            <div className={styles.statValue}>{brands.length}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>📂</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Classes</div>
            <div className={styles.statValue}>{classes.length}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fff3e0' }}>🔖</div>
          <div className={styles.statInfo}>
            <div className={styles.statLabel}>Total Types</div>
            <div className={styles.statValue}>{types.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        borderBottom: "2px solid #e0e0e0"
      }}>
        {["brands", "classes", "types"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              border: "none",
              background: activeTab === tab ? "#4e5dbdff" : "transparent",
              color: activeTab === tab ? "white" : "#666",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: activeTab === tab ? "600" : "400",
              textTransform: "capitalize"
            }}
          >
            {tab === "brands" ? "🏷️" : tab === "classes" ? "📂" : "🔖"} {tab === "brands" ? "names" : tab}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={handleAdd} className={styles.newRequestBtn}>
          + Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Data Table */}
      <div className={styles.activityCard}>
        <h3 className={styles.cardTitle}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
        </h3>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>Loading...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0", backgroundColor: "#f9f9f9" }}>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>ID</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Name</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Description</th>
                  <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Created</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentData().length > 0 ? (
                  getCurrentData().map(item => (
                    <tr key={item.BrandID || item.ClassID || item.TypeID} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          backgroundColor: "#f3e5f5",
                          color: "#7b1fa2",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          fontSize: "0.85rem"
                        }}>
                          #{item.BrandID || item.ClassID || item.TypeID}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontWeight: "600", color: "#2c3e50" }}>
                        {getItemName(item)}
                      </td>
                      <td style={{ padding: "16px", color: "#666" }}>
                        {item.Description || "—"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", color: "#78909c", fontSize: "0.85rem" }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: "6px 12px",
                            marginRight: "8px",
                            backgroundColor: "#4e5dbdff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "500"
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "500"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      No {activeTab} found. Click "Add New" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, color: "#2c3e50", fontSize: "1.5rem" }}>
              {modalMode === "add" ? "➕ Add New" : "✏️ Edit"} {activeTab.slice(0, -1)}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem"
                  }}
                  placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem",
                    minHeight: "100px",
                    resize: "vertical"
                  }}
                  placeholder="Optional description"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#4e5dbdff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  {modalMode === "add" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
