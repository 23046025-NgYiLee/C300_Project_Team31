"use client";
import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [totalItems, setTotalItems] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const inventory = [
      { id: 1, name: "Rose", quantity: 2, price: 5 },
      { id: 2, name: "Tulip", quantity: 10, price: 7 },
      { id: 3, name: "Orchid", quantity: 0, price: 12 },
    ];

    setTotalItems(inventory.reduce((acc, item) => acc + item.quantity, 0));
    setLowStock(inventory.filter(item => item.quantity <= 5));
    setRecent(inventory.slice(-3));
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <a href="/" className={styles.logout}>Logout</a>

      </header>

      <section className={styles.summary}>
        <div className={styles.card}>
          <h5>Total Inventory</h5>
          <h2>{totalItems}</h2>
        </div>
      </section>

      <section className={styles.lowStock}>
        <h3>Low Stock Alerts</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.length > 0 ? (
              lowStock.map(item => (
                <tr key={item.id}>
                  <td className={styles.td}>{item.name}</td>
                  <td className={styles.td} style={{ color: "red" }}>{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.td} colSpan="2">All stock levels are healthy.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className={styles.recent}>
        <h3>Recently Added Items</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Quantity</th>
              <th className={styles.th}>Price</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(item => (
              <tr key={item.id}>
                <td className={styles.td}>{item.name}</td>
                <td className={styles.td}>{item.quantity}</td>
                <td className={styles.td}>${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
