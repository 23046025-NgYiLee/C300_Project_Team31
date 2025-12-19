"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../AdminDashboard/dashboard.module.css";

export default function DashboardLayout({ children, activePage = "", userRole = "admin" }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("user")) || { name: "Admin" };
        setUser(loggedUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className={styles.dashboardPage}>
            {/* Top Navigation Bar */}
            <div className={styles.topBar}>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandName}>Inventory Pro</h1>
                </div>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search by project or item..."
                        className={styles.searchInput}
                    />
                </div>
                {user && (
                    <div className={styles.userSection}>
                        <span className={styles.userName}>{user.name}</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                    </div>
                )}
            </div>

            <div className={styles.mainLayout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <nav className={styles.sidebarNav}>
                        <Link href="/AdminDashboard" className={`${styles.navItem} ${activePage === "dashboard" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>📊</span>
                            Dashboard
                        </Link>
                        <Link href="/stocklist" className={`${styles.navItem} ${activePage === "stock" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>📦</span>
                            Stock
                        </Link>
                        <Link href="/payments" className={`${styles.navItem} ${activePage === "payment" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>💳</span>
                            Payment
                        </Link>
                        <Link href="/movement" className={`${styles.navItem} ${activePage === "movement" ? styles.active : ""}`}>
                            <span className={styles.navIcon}>🚚</span>
                            Movement
                        </Link>

                        {userRole === "admin" && (
                            <>
                                <Link href="/UserRegister" className={`${styles.navItem} ${activePage === "users" ? styles.active : ""}`}>
                                    <span className={styles.navIcon}>👥</span>
                                    User Management
                                </Link>

                                <div className={styles.navDivider} style={{ margin: "15px 0", borderTop: "1px solid #ddd" }}></div>

                                <Link href="/reports" className={`${styles.navItem} ${activePage === "reports" ? styles.active : ""}`}>
                                    <span className={styles.navIcon}>📊</span>
                                    Reports
                                </Link>
                            </>
                        )}
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
