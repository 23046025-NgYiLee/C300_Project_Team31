"use client";
import React, { useState, useEffect } from "react";
import CustomerLayout from "../../partials/CustomerLayout";
import styles from "../../AdminDashboard/dashboard.module.css";
import Link from "next/link";
import { addToCart } from "../../../utils/cartUtils";
import { API_BASE_URL } from "../../../config/api";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_BASE_URL}/api/stocks`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter to show only items with stock
          const availableProducts = data.filter(item => item.Quantity > 0);
          setProducts(availableProducts);
        } else {
          console.error("Shop products data is not an array:", data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error("Error fetching shop products:", err);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const categories = ["All", ...new Set((Array.isArray(products) ? products : []).map(p => p.ItemClass || "Uncategorized"))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.Brand || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.ItemClass === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedToCart({ ...addedToCart, [product.ItemID]: true });

    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'));

    // Reset animation after 2 seconds
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.ItemID]: false }));
    }, 2000);
  };

  return (
    <CustomerLayout activePage="shop">
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Shop Products 🛍️</h2>
        <p style={{ color: '#78909c', marginTop: '8px' }}>
          Browse our complete product catalog
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "250px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "0.95rem"
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "0.95rem",
            minWidth: "150px"
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className={styles.activityCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 className={styles.cardTitle}>
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Available
          </h3>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            Loading products...
          </p>
        ) : filteredProducts.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "24px"
          }}>
            {filteredProducts.map((product) => (
              <div key={product.ItemID} style={{
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#fff",
                transition: "box-shadow 0.2s",
                cursor: "pointer"
              }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = "none"}>
                <div style={{
                  width: "100%",
                  height: "150px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem"
                }}>
                  📦
                </div>
                <h4 style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#2c3e50"
                }}>
                  {product.ItemName}
                </h4>
                <p style={{
                  fontSize: "0.85rem",
                  color: "#78909c",
                  marginBottom: "8px"
                }}>
                  Brand: {product.Brand || "Quality Product"}
                </p>
                <p style={{
                  fontSize: "0.8rem",
                  color: "#546e7a",
                  marginBottom: "12px"
                }}>
                  Category: {product.ItemClass || "General"}
                </p>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px"
                }}>
                  <span style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#4caf50"
                  }}>
                    ${parseFloat(product.UnitPrice || 0).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: "0.85rem",
                    color: product.Quantity > 10 ? "#4caf50" : "#ff9800",
                    fontWeight: "600"
                  }}>
                    {product.Quantity} available
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button
                    className={styles.newRequestBtn}
                    style={{
                      flex: 1,
                      padding: "10px",
                      fontSize: "0.9rem",
                      backgroundColor: addedToCart[product.ItemID] ? "#4caf50" : "#1976d2"
                    }}
                    onClick={() => handleAddToCart(product)}
                  >
                    {addedToCart[product.ItemID] ? "✓ Added!" : "🛒 Add to Cart"}
                  </button>
                  <Link
                    href="/customer/cart"
                    style={{
                      flex: 0,
                      padding: "10px",
                      fontSize: "0.9rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f5f5f5",
                      color: "#2c3e50",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      minWidth: "40px"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#e0e0e0";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  >
                    🛒
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            No products found matching your criteria.
          </p>
        )}
      </div>
    </CustomerLayout>
  );
}
