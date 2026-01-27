"use client";
import React, { useState, useEffect } from "react";
import CustomerLayout from "../../partials/CustomerLayout";
import styles from "../../AdminDashboard/dashboard.module.css";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } from "../../../utils/cartUtils";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    setCart(getCart());
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(itemId, newQuantity);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const calculateItemTotal = (item) => {
    return (parseFloat(item.UnitPrice || 0) * item.quantity).toFixed(2);
  };

  const totalAmount = getCartTotal();

  return (
    <CustomerLayout activePage="cart">
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Shopping Cart 🛒</h2>
          <p style={{ color: '#78909c', marginTop: '8px' }}>
            Review your items before checkout
          </p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className={styles.activityCard}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "5rem", marginBottom: "24px" }}>🛒</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "12px", fontSize: "1.5rem" }}>
              Your Cart is Empty
            </h3>
            <p style={{ color: "#78909c", marginBottom: "32px", fontSize: "1.1rem" }}>
              Browse our products and add items to your cart
            </p>
            <Link href="/customer/shop" className={styles.newRequestBtn} style={{ fontSize: "1rem", padding: "12px 32px" }}>
              🛍️ Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className={styles.activityCard} style={{ marginBottom: "24px" }}>
            <h3 className={styles.cardTitle}>Cart Items ({cart.length})</h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Product</th>
                    <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Price</th>
                    <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Quantity</th>
                    <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Total</th>
                    <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.ItemID} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem"
                          }}>
                            📦
                          </div>
                          <div>
                            <strong style={{ fontSize: "1rem", color: "#2c3e50", display: "block" }}>
                              {item.ItemName}
                            </strong>
                            <span style={{ fontSize: "0.85rem", color: "#78909c" }}>
                              Name: {item.Brand || "Quality Product"}
                            </span>
                            {item.quantity > item.Quantity && (
                              <div style={{
                                fontSize: "0.8rem",
                                color: "#f44336",
                                marginTop: "4px",
                                fontWeight: "600"
                              }}>
                                ⚠️ Only {item.Quantity} in stock
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", color: "#546e7a", fontWeight: "600" }}>
                        ${parseFloat(item.UnitPrice || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => handleQuantityChange(item.ItemID, item.quantity - 1)}
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: "#f5f5f5",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "700",
                              fontSize: "1.2rem"
                            }}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.Quantity}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.ItemID, parseInt(e.target.value) || 1)}
                            style={{
                              width: "60px",
                              padding: "8px",
                              textAlign: "center",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              fontSize: "1rem",
                              fontWeight: "600"
                            }}
                          />
                          <button
                            onClick={() => handleQuantityChange(item.ItemID, item.quantity + 1)}
                            disabled={item.quantity >= item.Quantity}
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: item.quantity >= item.Quantity ? "#e0e0e0" : "#f5f5f5",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              cursor: item.quantity >= item.Quantity ? "not-allowed" : "pointer",
                              fontWeight: "700",
                              fontSize: "1.2rem"
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right", fontWeight: "700", color: "#4caf50", fontSize: "1.1rem" }}>
                        ${calculateItemTotal(item)}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <button
                          onClick={() => handleRemoveItem(item.ItemID)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            border: "1px solid #ffcdd2",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem"
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
            {/* Continue Shopping */}
            <div className={styles.activityCard}>
              <h3 className={styles.cardTitle}>Continue Shopping</h3>
              <p style={{ color: "#78909c", marginBottom: "20px" }}>
                Need more items? Browse our product catalog
              </p>
              <Link
                href="/customer/shop"
                className={styles.newRequestBtn}
                style={{
                  display: "inline-block",
                  textDecoration: "none"
                }}
              >
                🛍️ Browse More Products
              </Link>
            </div>

            {/* Order Summary */}
            <div className={styles.activityCard}>
              <h3 className={styles.cardTitle}>Order Summary</h3>

              <div style={{ padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1rem" }}>
                  <span style={{ color: "#546e7a" }}>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span style={{ fontWeight: "600", color: "#2c3e50" }}>${totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "1rem" }}>
                  <span style={{ color: "#546e7a" }}>Shipping:</span>
                  <span style={{ fontWeight: "600", color: "#4caf50" }}>FREE</span>
                </div>
                <div style={{ borderTop: "2px solid #e0e0e0", marginTop: "16px", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
                    <span style={{ fontWeight: "700", color: "#2c3e50" }}>Total:</span>
                    <span style={{ fontWeight: "700", color: "#4caf50" }}>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className={styles.newRequestBtn}
                style={{
                  width: "100%",
                  display: "block",
                  textAlign: "center",
                  padding: "16px",
                  fontSize: "1.1rem",
                  marginTop: "16px"
                }}
              >
                💳 Proceed to Checkout
              </Link>

              <div style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#f0f7ff",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#546e7a"
              }}>
                ✓ Secure checkout<br />
                ✓ Email confirmation<br />
                ✓ Order tracking
              </div>
            </div>
          </div>
        </>
      )}
    </CustomerLayout>
  );
}
