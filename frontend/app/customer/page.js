"use client";
import React, { useState, useEffect } from "react";
import CustomerLayout from "../partials/CustomerLayout";
import styles from "../AdminDashboard/dashboard.module.css";
import Link from "next/link";
import { addToCart } from "../../utils/cartUtils";
import { API_BASE_URL } from "../../config/api";

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    // Get customer info from localStorage
    const loggedCustomer = JSON.parse(localStorage.getItem("customer"));
    if (!loggedCustomer) {
      // If not logged in, create a guest session
      const guestCustomer = { name: "Guest Customer", email: "" };
      localStorage.setItem("customer", JSON.stringify(guestCustomer));
      setCustomer(guestCustomer);
    } else {
      setCustomer(loggedCustomer);
    }

    // Fetch featured products
    fetch(`${API_BASE_URL}/api/stocks`)
      .then(res => res.json())
      .then(data => {
        // Show only products with stock
        const availableProducts = data.filter(item => item.Quantity > 0).slice(0, 6);
        setProducts(availableProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

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
    <CustomerLayout activePage="dashboard">
      {/* Welcome Banner */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Welcome, {customer?.name || "Guest"}! 👋</h2>
          <p style={{ color: '#78909c', marginTop: '8px' }}>
            Browse our inventory and place your orders
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.statsGrid} style={{ marginBottom: "32px" }}>
        <Link href="/customer/shop" style={{ textDecoration: "none" }}>
          <div className={styles.statCard} style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>🛍️</div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Shop Products</div>
              <div className={styles.statValue} style={{ fontSize: "1rem" }}>Browse Catalog</div>
            </div>
          </div>
        </Link>

        <Link href="/checkout" style={{ textDecoration: "none" }}>
          <div className={styles.statCard} style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💳</div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Quick Checkout</div>
              <div className={styles.statValue} style={{ fontSize: "1rem" }}>Place an Order</div>
            </div>
          </div>
        </Link>

        <Link href="/customer/orders" style={{ textDecoration: "none" }}>
          <div className={styles.statCard} style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
            <div className={styles.statIcon} style={{ background: '#fff3e0' }}>📦</div>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>My Orders</div>
              <div className={styles.statValue} style={{ fontSize: "1rem" }}>Track Shipments</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Featured Products */}
      <div className={styles.activityCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 className={styles.cardTitle}>Featured Products</h3>
          <Link href="/customer/shop" className={styles.newRequestBtn}>
            View All Products →
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            Loading products...
          </p>
        ) : products.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "24px"
          }}>
            {products.map((product) => (
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
                  marginBottom: "12px"
                }}>
                  {product.Brand || "Quality Product"}
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
                    {product.Quantity} in stock
                  </span>
                </div>
                <button
                  className={styles.newRequestBtn}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    fontSize: "0.9rem",
                    backgroundColor: addedToCart[product.ItemID] ? "#4caf50" : "#1976d2"
                  }}
                  onClick={() => handleAddToCart(product)}
                >
                  {addedToCart[product.ItemID] ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
            No products available at the moment.
          </p>
        )}
      </div>

      {/* Info Section */}
      <div style={{
        marginTop: "32px",
        padding: "24px",
        backgroundColor: "#f0f7ff",
        borderRadius: "12px",
        border: "1px solid #d0e7ff"
      }}>
        <h3 style={{ marginTop: 0, color: "#2c3e50", marginBottom: "16px" }}>
          📧 Email Confirmation Available
        </h3>
        <p style={{ color: "#546e7a", marginBottom: "12px" }}>
          ✓ Receive order confirmations via email<br />
          ✓ Get tracking information for your shipments<br />
          ✓ Stay updated on your order status
        </p>
        <Link href="/checkout" className={styles.newRequestBtn}>
          Start Shopping →
        </Link>
      </div>
    </CustomerLayout>
  );
}
