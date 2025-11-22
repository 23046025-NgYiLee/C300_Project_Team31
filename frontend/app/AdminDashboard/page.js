"use client";
import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardHome() {
  // User Greeting & Logout
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user")) || { name: "Admin" };
    setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Inventory Data
  const [stocks, setStocks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // Load stock data from backend
  useEffect(() => {
  async function loadStocks() {
    try {
      const res = await fetch("http://localhost:4000/stocklist");
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Error loading stocks:", err);
    }
  }
  loadStocks();
}, []);


  // Inventory Feature Cards
  const features = [
    { title: "Inbound Production Tracking", desc: "Input production numbers for incoming stock." },
    { title: "Outbound Production Tracking", desc: "Track outbound production numbers efficiently." },
    { title: "Stock Movement Monitoring", desc: "Track movement transactions for traceability." },
    { title: "Stock Taking Capabilities", desc: "Accurate inventory counting in real-time." },
    { title: "Comprehensive Reporting Tools", desc: "Detailed analytics to support decision making." },
    { title: "Supervisor Access Features", desc: "Ensure oversight and accuracy in stock management." }
  ];

  return (
    <div className={styles.page}>
      {/* User Greeting & Logout */}
      {user && (
        <div className={styles.userSection}>
          <span className={styles.userWelcome}>Welcome, {user.name}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      )}

      {/* Admin Header */}
      <header className={styles.header}>
        <Link href="/UserRegister" className={styles.register}>Send register forms</Link>
        <h1 className={styles.heading}>Admin Dashboard</h1>
      </header>

      {/* Inventory Summary */}
      <section className={styles.summary}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Inventory</span>
          <span className={styles.cardValue}>{totalItems}</span>
        </div>
      </section>

      {/* Low Stock Alerts */}
      <section className={styles.lowStock}>
        <h3 className={styles.sectionTitle}>Low Stock Alerts</h3>
        <div className={styles.actions}>
          <Link href="/addstocks" className={styles.register}>Add Stocks</Link>
          <Link href="/stocklist" className={styles.register}>Stock List</Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {stocks.filter(item => item.quantity <= 10).map((item, index) => (
              <tr key={index}>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.quantity}</td>
              </tr>
            ))}
            {stocks.filter(item => item.quantity <= 10).length === 0 && (
              <tr>
                <td className={styles.td} colSpan="2" style={{ textAlign: "center", color: "#999" }}>
                  No low stock items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Recently Added Items */}
      <section className={styles.recent}>
        <h3 className={styles.sectionTitle}>Recently Added Items</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Quantity</th>
              <th className={styles.th}>Price</th>
            </tr>
          </thead>
          <tbody>
            {stocks.slice(-5).map((item, index) => (
              <tr key={index}>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.quantity}</td>
                <td className={styles.td}>${item.price.toFixed(2)}</td>
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td className={styles.td} colSpan="3" style={{ textAlign: "center", color: "#999" }}>
                  No recently added items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Inventory Features */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Inventory Features</h2>
        <div className={styles.cardContainer}>
          {features.map((f, i) => (
            <div key={i} className={styles.cardFeature}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
