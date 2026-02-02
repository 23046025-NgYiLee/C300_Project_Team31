"use client";
import React, { useState, useEffect } from "react";
import CustomerLayout from "../partials/CustomerLayout";
import styles from "../AdminDashboard/dashboard.module.css";
import { sendOrderConfirmationEmail } from "../../utils/emailService";
import { getCart, getCartTotal, clearCart } from "../../utils/cartUtils";
import { API_BASE_URL } from "../../config/api";

export default function CheckoutPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productionNumber, setProductionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Use cart items instead of demo items
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart items
    const cartItems = getCart();
    setCart(cartItems);

    // Load customer info if available
    const customer = JSON.parse(localStorage.getItem("customer"));
    if (customer && customer.name && customer.name !== "Guest") {
      setCustomerName(customer.name);
    }
    if (customer && customer.email) {
      setCustomerEmail(customer.email);
    }
  }, []);

  const calculateTotal = () => {
    return getCartTotal();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Check if cart is empty
    if (cart.length === 0) {
      setMessage('✗ Your cart is empty. Please add items before checkout.');
      setLoading(false);
      return;
    }

    try {
      // Format corderItemsitems for the order
      const orderItems = cart.map(item => ({
        name: item.ItemName,
        quantity: item.quantity,
        price: parseFloat(item.UnitPrice || 0)
      }));

      // Get accountID if logged in
      const customer = JSON.parse(localStorage.getItem("customer"));
      const accountID = customer ? customer.accountID : null;

      // 1. Process the order in your backend
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail,
          customerName,
          items: cart,
          totalAmount: calculateTotal(),
          productionNumber: productionNumber || null,
          accountID: accountID
        })
      });

      // Check if response is JSON
      const contentType = orderResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server returned invalid response. Make sure backend is running on port 4000.');
      }

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Order processing failed');
      }

      // 2. Send confirmation email using EmailJS
      const emailResult = await sendOrderConfirmationEmail({
        customerName,
        customerEmail,
        orderId: orderData.orderId || `ORD-${Date.now()}`,
        orderDate: new Date(),
        totalAmount: calculateTotal(),
        items: orderItems,
        status: 'Confirmed'
      });

      if (emailResult.success) {
        setMessage(`✓ Order placed successfully! Confirmation email sent to ${customerEmail}`);
        // Clear cart and form
        clearCart();
        setCart([]);
        window.dispatchEvent(new Event('cartUpdated'));
        setCustomerEmail('');
        setCustomerName('');

        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          window.location.href = '/customer/orders';
        }, 3000);
      } else {
        setMessage('✓ Order placed successfully, but email notification failed. Please check your email settings.');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      setMessage(`✗ ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout activePage="checkout">
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Checkout</h2>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Cart Summary */}
        <div className={styles.activityCard} style={{ marginBottom: "24px" }}>
          <h3 className={styles.cardTitle}>Order Summary</h3>

          {cart.length > 0 ? (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ textAlign: "left", padding: "12px" }}>Item</th>
                    <th style={{ textAlign: "center", padding: "12px" }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "12px" }}>Price</th>
                    <th style={{ textAlign: "right", padding: "12px" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.ItemID} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px" }}>{item.ItemName}</td>
                      <td style={{ textAlign: "center", padding: "12px" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right", padding: "12px" }}>${parseFloat(item.UnitPrice || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right", padding: "12px", fontWeight: "600" }}>
                        ${(item.quantity * parseFloat(item.UnitPrice || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #2c3e50" }}>
                    <td colSpan="3" style={{ padding: "12px", fontWeight: "700", fontSize: "1.1rem" }}>
                      Total
                    </td>
                    <td style={{ textAlign: "right", padding: "12px", fontWeight: "700", fontSize: "1.2rem", color: "#4caf50" }}>
                      ${calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </>
          ) : (
            <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
              Your cart is empty
            </p>
          )}
        </div>

        {/* Checkout Form */}
        {cart.length > 0 && (
          <div className={styles.activityCard}>
            <h3 className={styles.cardTitle}>Customer Information</h3>

            {message && (
              <div style={{
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                backgroundColor: message.includes('✓') ? '#e8f5e9' : '#ffebee',
                color: message.includes('✓') ? '#2e7d32' : '#c62828',
                border: `1px solid ${message.includes('✓') ? '#c8e6c9' : '#ffcdd2'}`
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleCheckout}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem"
                  }}
                />
                <small style={{ color: "#78909c", fontSize: "0.85rem" }}>
                  📧 Order confirmation will be sent to this email
                </small>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>
                  Production/Batch Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`e.g. IN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`}
                  value={productionNumber}
                  onChange={(e) => setProductionNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "0.95rem"
                  }}
                />
                <small style={{ color: "#78909c", fontSize: "0.85rem" }}>
                  📦 Inbound production number for inventory tracking
                </small>
              </div>

              <div style={{
                backgroundColor: "#f0f7ff",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #d0e7ff"
              }}>
                <p style={{ margin: 0, color: "#1565c0", fontSize: "0.9rem" }}>
                  ✓ You'll receive an order confirmation email with your order details and tracking information.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.newRequestBtn}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1rem",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Processing Order...' : '✓ Complete Purchase'}
              </button>
            </form>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
