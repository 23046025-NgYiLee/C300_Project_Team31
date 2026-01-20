"use client";
import React, { useState, useEffect } from "react";
import styles from "../AdminDashboard/dashboard.module.css";
import Link from "next/link";

export default function SupervisorDashboard() {
    const [user, setUser] = useState(null);
    const [stocks, setStocks] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStock: 0,
        totalValue: 0,
        recentlyAdded: 0
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem("user")) || { name: "Supervisor" };
        setUser(loggedUser);
    }, []);

    useEffect(() => {
        fetch('http://localhost:4000/api/stocks')
            .then(res => res.json())
            .then(data => {
                setStocks(data);
                const totalItems = data.reduce((sum, item) => sum + (item.Quantity || 0), 0);
                const lowStock = data.filter(item => item.Quantity <= 10).length;
                const totalValue = data.reduce((sum, item) => sum + ((item.Quantity || 0) * (item.UnitPrice || 0)), 0);
                const recentlyAdded = data.slice(-7).length;

                setStats({ totalItems, lowStock, totalValue, recentlyAdded });
            }).catch(() => setStocks([]));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const groupedStocks = stocks.reduce((acc, stock) => {
        const category = stock.ItemCategory || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(stock);
        return acc;
    }, {});

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.topBar}>
                <button className={styles.menuButton} onClick={toggleMobileMenu}>☰</button>
                <div className={styles.brandSection}>
                    <h1 className={styles.brandName}>Inventory Pro - Supervisor</h1>
                </div>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Search stocks or reports..." className={styles.searchInput} />
                </div>
                {user && (
                    <div className={styles.userSection}>
                        <span className={styles.userName}>{user.name}</span>
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                    </div>
                )}
            </div>

            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay} onClick={toggleMobileMenu}></div>
            )}

            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
                <div className={styles.mobileMenuHeader}>
                    <h2 className={styles.mobileMenuTitle}>Menu</h2>
                    <button className={styles.closeMenuButton} onClick={toggleMobileMenu}>×</button>
                </div>
                <nav className={styles.sidebarNav}>
                    <Link href="/SupervisorDashboard" className={`${styles.navItem} ${styles.active}`} onClick={toggleMobileMenu}>
                        <span className={styles.navIcon}>📊</span>Dashboard
                    </Link>
                    <Link href="/stocklist" className={styles.navItem} onClick={toggleMobileMenu}>
                        <span className={styles.navIcon}>📦</span>Stock
                    </Link>
                    <Link href="/payments" className={styles.navItem} onClick={toggleMobileMenu}>
                        <span className={styles.navIcon}>💳</span>Payment
                    </Link>
                    <Link href="/movement" className={styles.navItem} onClick={toggleMobileMenu}>
                        <span className={styles.navIcon}>🚚</span>Movement
                    </Link>
                    <div className={styles.navDivider} style={{ margin: "15px 0", borderTop: "1px solid #ddd" }}></div>
                    <Link href="/reports" className={styles.navItem} onClick={toggleMobileMenu}>
                        <span className={styles.navIcon}>📈</span>Reports
                    </Link>
                </nav>
            </div>

            <div className={styles.mainLayout}>
                <aside className={styles.sidebar}>
                    <nav className={styles.sidebarNav}>
                        <Link href="/SupervisorDashboard" className={`${styles.navItem} ${styles.active}`}>
                            <span className={styles.navIcon}>📊</span>Dashboard
                        </Link>
                        <Link href="/stocklist" className={styles.navItem}>
                            <span className={styles.navIcon}>📦</span>Stock
                        </Link>
                        <Link href="/payments" className={styles.navItem}>
                            <span className={styles.navIcon}>💳</span>Payment
                        </Link>
                        <Link href="/movement" className={styles.navItem}>
                            <span className={styles.navIcon}>🚚</span>Movement
                        </Link>
                        <div className={styles.navDivider} style={{ margin: "15px 0", borderTop: "1px solid #ddd" }}></div>
                        <Link href="/reports" className={styles.navItem}>
                            <span className={styles.navIcon}>📈</span>Reports
                        </Link>
                    </nav>
                </aside>

                <main className={styles.mainContent}>
                    <div className={styles.pageHeader}>
                        <h2 className={styles.pageTitle}>Supervisor Dashboard</h2>
                        <Link href="/stocklist" className={styles.newRequestBtn}>View All Items</Link>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>📦</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Items</div>
                                <div className={styles.statValue}>{stats.totalItems}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fff3e0' }}>⚠️</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Low Stock Items</div>
                                <div className={styles.statValue}>{stats.lowStock}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💰</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Value</div>
                                <div className={styles.statValue}>${stats.totalValue.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f3e5f5' }}>📈</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Recent Additions</div>
                                <div className={styles.statValue}>{stats.recentlyAdded}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.warehouseSection}>
                        <h3 className={styles.sectionTitle}>Supervisor Capabilities</h3>
                        <div className={styles.warehouseGrid}>
                            <Link href="/stocktaking" className={styles.warehouseCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.itemCount}>
                                        <span className={styles.countIcon}>📋</span>SUPERVISOR ONLY
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h4 className={styles.warehouseName}>Stock Taking</h4>
                                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                                        Physical inventory counts and variance checking
                                    </p>
                                </div>
                            </Link>

                            <Link href="/reports" className={styles.warehouseCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.itemCount}>
                                        <span className={styles.countIcon}>📈</span>SUPERVISOR ACCESS
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h4 className={styles.warehouseName}>Reports</h4>
                                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                                        Generate comprehensive reports and analytics
                                    </p>
                                </div>
                            </Link>

                            <Link href="/stocklist" className={styles.warehouseCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.itemCount}>
                                        <span className={styles.countIcon}>📦</span>VIEW
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h4 className={styles.warehouseName}>Inventory</h4>
                                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                                        Browse and manage all stock items
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className={styles.warehouseSection}>
                        <h3 className={styles.sectionTitle}>Inventory by Category</h3>
                        <div className={styles.warehouseGrid}>
                            {Object.keys(groupedStocks).slice(0, 6).map((category, index) => (
                                <div key={index} className={styles.warehouseCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.itemCount}>
                                            <span className={styles.countIcon}>📦</span>{groupedStocks[category].length} items
                                        </div>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h4 className={styles.warehouseName}>{category}</h4>
                                        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
                                            Total: {groupedStocks[category].reduce((sum, item) => sum + item.Quantity, 0)} units
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <aside className={styles.rightSidebar}>
                    <div className={styles.popularSection}>
                        <h3 className={styles.sidebarTitle}>Supervisor Access</h3>
                        <div style={{
                            backgroundColor: "#e8f5e9",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "16px",
                            borderLeft: "3px solid #4caf50"
                        }}>
                            <p style={{ margin: "0", fontSize: "0.85rem", color: "#2e7d32" }}>
                                ✓ Stock Taking Authorized
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: "#e8f5e9",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "16px",
                            borderLeft: "3px solid #4caf50"
                        }}>
                            <p style={{ margin: "0", fontSize: "0.85rem", color: "#2e7d32" }}>
                                ✓ Report Generation Authorized
                            </p>
                        </div>
                    </div>

                    <div className={styles.topMaterialsSection}>
                        <h3 className={styles.sidebarTitle}>Low Stock Alert</h3>
                        <div className={styles.materialsList}>
                            {stocks.filter(item => item.Quantity <= 10).slice(0, 5).map((item, index) => (
                                <div key={index} className={styles.materialItem}>
                                    <div className={styles.materialRank} style={{ background: '#ff9800' }}>!</div>
                                    <div className={styles.materialName}>{item.ItemName}</div>
                                    <div className={styles.materialQty} style={{ color: '#f44336' }}>{item.Quantity}</div>
                                </div>
                            ))}
                            {stocks.filter(item => item.Quantity <= 10).length === 0 && (
                                <p style={{ color: '#4caf50', fontSize: '0.9rem', textAlign: 'center' }}>
                                    All stock levels are healthy ✓
                                </p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
