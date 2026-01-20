"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../AdminDashboard/dashboard.module.css";
import { getCartItemCount } from "../../utils/cartUtils";

export default function CustomerLayout({ children, activePage = "" }) {
    const [customer, setCustomer] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const loggedCustomer = JSON.parse(localStorage.getItem("customer")) || { name: "Guest", email: "" };
        setCustomer(loggedCustomer);
        
        // Update cart count
        updateCartCount();
        
        // Listen for cart updates
        const handleCartUpdate = () => updateCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);
    
    const updateCartCount = () => {
        setCartCount(getCartItemCount());
    };

    const handleLogout = () => {
        localStorage.removeItem("customer");
        window.location.href = "/";
    };

    return (
        <div className={styles.dashboardPage}>
            {/* Top Navigation Bar */}
            <div className={styles.topBar}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandName}>🛒 Inventory Pro - Customer Portal</h1>
                </div>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                    />
                </div>
                {customer && (
                    <div className={styles.userSection}>
                        <span className={styles.userName}>{customer.name || customer.email}</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                    </div>
                )}
            </div>

            <div className={styles.mainLayout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <nav className={styles.sidebarNav}>
                        <Link href="/customer" className={`${styles.navItem} ${activePage === "dashboard" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>🏠</span>
                            Home
                        </Link>
                        <Link href="/customer/shop" className={`${styles.navItem} ${activePage === "shop" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>🛍️</span>
                            Shop Products
                        </Link>
                        <Link href="/customer/cart" className={`${styles.navItem} ${activePage === "cart" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>🛒</span>
                            Shopping Cart
                            {cartCount > 0 && (
                                <span style={{
                                    marginLeft: "auto",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    borderRadius: "50%",
                                    padding: "2px 8px",
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    minWidth: "20px",
                                    textAlign: "center"
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/checkout" className={`${styles.navItem} ${activePage === "checkout" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>💳</span>
                            Checkout
                        </Link>
                        <Link href="/customer/orders" className={`${styles.navItem} ${activePage === "orders" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>📦</span>
                            My Orders
                        </Link>
                        <Link href="/customer/profile" className={`${styles.navItem} ${activePage === "profile" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>👤</span>
                            Profile
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}
