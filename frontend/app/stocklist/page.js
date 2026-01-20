"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
// Make sure this path points to your actual layout component
import DashboardLayout from "../partials/DashboardLayout";
// Ensure these CSS modules exist at these paths
import styles from "./listcss.module.css";
import dashboardStyles from "../AdminDashboard/dashboard.module.css";

export default function StockListPage() {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterType, setFilterType] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Modal and form state
  const [showModal, setShowModal] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    brand: "",
    ItemClass: "",
    type: "",
    category: "",
    supplier: "",
    unitPrice: "",
    dateAdded: "",
    lastUpdated: "",
    imageFile: null
  });

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    classes: [],
    types: []
  });

  // Fetch filter options on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stocks/filters/values`)
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(err => console.error('Error fetching filter options:', err));
  }, []);

  // Fetch stocks with filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.append('search', searchTerm);
    if (filterBrand) params.append('brand', filterBrand);
    if (filterClass) params.append('class', filterClass);
    if (filterType) params.append('type', filterType);
    if (minQuantity) params.append('minQty', minQuantity);
    if (maxQuantity) params.append('maxQty', maxQuantity);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/stocks${queryString ? '?' + queryString : ''}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]));
  }, [searchTerm, filterBrand, filterClass, filterType, minQuantity, maxQuantity]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterBrand("");
    setFilterClass("");
    setFilterType("");
    setMinQuantity("");
    setMaxQuantity("");
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('quantity', form.quantity);
      formData.append('brand', form.brand);
      formData.append('ItemClass', form.ItemClass);
      formData.append('type', form.type);
      formData.append('category', form.category);
      formData.append('supplier', form.supplier);
      formData.append('unitPrice', form.unitPrice);
      formData.append('dateAdded', form.dateAdded);
      formData.append('lastUpdated', form.lastUpdated);

      // Append image file if selected
      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/stocks`, {
        method: "POST",
        body: formData // Don't set Content-Type header, browser will set it with boundary
      });
      const data = await res.json();
      if (res.ok) {
        setFormMessage("Stock added successfully!");
        setForm({
          name: "",
          quantity: "",
          brand: "",
          ItemClass: "",
          type: "",
          category: "",
          supplier: "",
          unitPrice: "",
          dateAdded: "",
          lastUpdated: "",
          imageFile: null
        });
        setTimeout(() => {
          setShowModal(false);
          setFormMessage("");
          window.location.reload();
        }, 1500);
      } else {
        setFormMessage(data.error || "Failed to add stock.");
      }
    } catch {
      setFormMessage("Error connecting to server.");
    }
  };

  return (
    <DashboardLayout activePage="stock">
      {/* Page Header */}
      <div className={dashboardStyles.pageHeader}>
        <div>
          <h2 className={dashboardStyles.pageTitle}>Stock Inventory</h2>

          {/* --- NEW LINK ADDED HERE --- */}
          <Link
            href="/stocktaking"
            style={{
              display: "inline-block",
              marginTop: "5px",
              color: "#4e5dbdff",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "0.95rem"
            }}
          >
            ➜ Go to Stock Taking
          </Link>
          {/* --------------------------- */}

        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              // Download overall inventory report as CSV
              window.open(`${API_BASE_URL}/api/reports/inventory/csv`, '_blank');
            }}
            className={dashboardStyles.newRequestBtn}
            style={{ backgroundColor: "#27ae60" }}
          >
            📊 Overall Report
          </button>
          <button onClick={() => setShowModal(true)} className={dashboardStyles.newRequestBtn}>
            + Add New Stock
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name, brand, class, or type..."
          className={dashboardStyles.searchInput}
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e0e0e0" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterGrid}>
          <div className={styles.filterItem}>
            <label htmlFor="brandFilter">Brand</label>
            <select
              id="brandFilter"
              className="form-select"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {filterOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="classFilter">Class</label>
            <select
              id="classFilter"
              className="form-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {filterOptions.classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="typeFilter">Type</label>
            <select
              id="typeFilter"
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {filterOptions.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="minQty">Min Quantity</label>
            <input
              id="minQty"
              type="number"
              className="form-control"
              placeholder="Min"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              min="0"
            />
          </div>

          <div className={styles.filterItem}>
            <label htmlFor="maxQty">Max Quantity</label>
            <input
              id="maxQty"
              type="number"
              className="form-control"
              placeholder="Max"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              min="0"
            />
          </div>

          <div className={styles.filterItem} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary w-100"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className={styles.resultsCount}>
          Showing {stocks.length} item{stocks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className={styles.cardGrid}>
        {stocks.length === 0 ? (
          <div style={{ width: "100%", color: "#777", textAlign: "center", padding: "2rem" }}>
            No stocks match your search criteria.
          </div>
        ) : (
          stocks.map((stock) => (
            <div className={styles.cardCol} key={stock.ItemID}>
              <div className={styles.stockCard}>
                <div className={styles.stockImgWrap}>
                  <img
                    className={styles.stockImage}
                    src={`${API_BASE_URL}/images/${stock.ImagePath || 'placeholder.png'}`}
                    alt={`${stock.ItemName} image`}
                    onError={(e) => { e.target.src = `${API_BASE_URL}/images/placeholder.png` }}
                  />
                </div>
                <div className={styles.stockCardBody}>
                  <div className={styles.stockCardTitle}>{stock.ItemName}</div>
                  <div className={styles.stockCardDesc}>
                    Quantity: {stock.Quantity}<br />
                    Brand: {stock.Brand}<br />
                    Class: {stock.ItemClass}<br />
                    Type: {stock.ItemType}<br />
                  </div>
                  <div className={styles.actionButtons}>
                    <Link href={`/stocklist/detail/${stock.ItemID}`} className={`${styles.actionBtn} ${styles.detailBtn}`}>
                      <span>ℹ️</span> Detail
                    </Link>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          fetch(`${API_BASE_URL}/api/stocks/${stock.ItemID}`, {
                            method: 'DELETE'
                          })
                            .then(res => res.json())
                            .then(() => {
                              setStocks(prevStocks => prevStocks.filter(s => s.ItemID !== stock.ItemID));
                            })
                        }
                      }}
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Stock Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Stock</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>
            {formMessage && (
              <div className={formMessage.includes('success') ? styles.successMessage : styles.errorMessage}>
                {formMessage}
              </div>
            )}
            <form onSubmit={handleFormSubmit} className={styles.addStockForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Stock Name *</label>
                  <input type="text" id="name" name="name" value={form.name} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="quantity">Quantity *</label>
                  <input type="number" id="quantity" name="quantity" min="0" step="1" value={form.quantity} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="brand">Brand *</label>
                  <input type="text" id="brand" name="brand" value={form.brand} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ItemClass">Class *</label>
                  <input type="text" id="ItemClass" name="ItemClass" value={form.ItemClass} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="type">Type *</label>
                  <input type="text" id="type" name="type" value={form.type} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="category">Category *</label>
                  <input type="text" id="category" name="category" value={form.category} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="supplier">Supplier *</label>
                  <input type="text" id="supplier" name="supplier" value={form.supplier} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="unitPrice">Unit Price *</label>
                  <input type="number" id="unitPrice" name="unitPrice" min="0" step="0.01" value={form.unitPrice} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="dateAdded">Date Added *</label>
                  <input type="date" id="dateAdded" name="dateAdded" value={form.dateAdded} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastUpdated">Last Updated *</label>
                  <input type="date" id="lastUpdated" name="lastUpdated" value={form.lastUpdated} onChange={handleFormChange} required style={{ backgroundColor: "#ffffff" }} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="imageFile">Product Image</label>
                  <input
                    type="file"
                    id="imageFile"
                    name="imageFile"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: "#ffffff"
                    }}
                  />
                  <small style={{ color: '#78909c', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    Upload product image (JPG, PNG, etc.). Max size: 5MB
                  </small>
                  {form.imageFile && (
                    <div style={{ marginTop: "8px", color: "#4caf50", fontSize: "0.9rem" }}>
                      ✓ Selected: {form.imageFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}