"use client";
import React, { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { API_BASE_URL } from "../config/api";

export default function AdminDashboard() {
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
    const loggedUser = JSON.parse(localStorage.getItem("user")) || { name: "Admin" };
    setUser(loggedUser);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stocks`)
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        // Calculate statistics
        const totalItems = data.reduce((sum, item) => sum + (item.Quantity || 0), 0);
        const lowStock = data.filter(item => item.Quantity <= 10).length;
        const totalValue = data.reduce((sum, item) => sum + ((item.Quantity || 0) * (item.UnitPrice || 0)), 0);
        const recentlyAdded = data.slice(-7).length;

        setStats({
          totalItems,
          lowStock,
          totalValue,
          recentlyAdded
        });
      })
      .catch(() => setStocks([]));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Group stocks by category or brand for warehouse-style display
  const groupedStocks = stocks.reduce((acc, stock) => {
    const category = stock.ItemCategory || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(stock);
    return acc;
  }, {});

  return (
    <div className={styles.dashboardPage}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <button className={styles.menuButton} onClick={toggleMobileMenu}>
          ☰
        </button>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={toggleMobileMenu}></div>
      )}

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <h2 className={styles.mobileMenuTitle}>Menu</h2>
          <button className={styles.closeMenuButton} onClick={toggleMobileMenu}>
            ×
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/AdminDashboard" className={`${styles.navItem} ${styles.active}`} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link href="/stocklist" className={styles.navItem} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>📦</span>
            Stock
          </Link>
          <Link href="/payments" className={styles.navItem} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>💳</span>
            Payment
          </Link>
          <Link href="/movement" className={styles.navItem} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>🚚</span>
            Movement
          </Link>
          <Link href="/UserRegister" className={styles.navItem} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>👥</span>
            User Management
          </Link>
          <div className={styles.navDivider} style={{ margin: "15px 0", borderTop: "1px solid #ddd" }}></div>
          <Link href="/reports" className={styles.navItem} onClick={toggleMobileMenu}>
            <span className={styles.navIcon}>📊</span>
            Reports
          </Link>
        </nav>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link href="/AdminDashboard" className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </Link>
            <Link href="/stocklist" className={styles.navItem}>
              <span className={styles.navIcon}>📦</span>
              Stock
            </Link>
            <Link href="/payments" className={styles.navItem}>
              <span className={styles.navIcon}>💳</span>
              Payment
            </Link>
            <Link href="/movement" className={styles.navItem}>
              <span className={styles.navIcon}>🚚</span>
              Movement
            </Link>
            <Link href="/UserRegister" className={styles.navItem}>
              <span className={styles.navIcon}>👥</span>
              User Management
            </Link>


            <div className={styles.navDivider} style={{ margin: "15px 0", borderTop: "1px solid #ddd" }}></div>

            <Link href="/reports" className={styles.navItem}>
              <span className={styles.navIcon}>📊</span>
              Reports
            </Link>


          </nav>
        </aside>

        {/* Main Content  */}
        <main className={styles.mainContent}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>Stock Overview</h2>
            <Link href="/stocklist" className={styles.newRequestBtn}>
              View All Items
            </Link>
          </div>

          {/* Stats Cards */}
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

          {/* Warehouse Cards Grid */}
          <div className={styles.warehouseSection}>
            <h3 className={styles.sectionTitle}>Stock Categories</h3>
            <div className={styles.warehouseGrid}>
              {Object.keys(groupedStocks).slice(0, 6).map((category, index) => (
                <div key={index} className={styles.warehouseCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.itemCount}>
                      <span className={styles.countIcon}>📦</span>
                      {groupedStocks[category].length} ITEMS
                    </div>
                    <button className={styles.cardMenu}>⋯</button>
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.warehouseName}>{category}</h4>
                    <div className={styles.warehouseStats}>
                      <div className={styles.statBadge}>
                        <span className={styles.badgeValue}>
                          {groupedStocks[category].reduce((sum, item) => sum + (item.Quantity || 0), 0)}
                        </span>
                        <span className={styles.badgeLabel}>Total Qty</span>
                      </div>
                      <div className={styles.statBadge}>
                        <span className={styles.badgeValue}>
                          {groupedStocks[category].filter(item => item.Quantity <= 10).length}
                        </span>
                        <span className={styles.badgeLabel}>Low Stock</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    Last updated: Today
                  </div>
                </div>
              ))}

              {/* Add New Category Card */}
              <Link href="/stocklist" className={styles.addWarehouseCard}>
                <div className={styles.addIcon}>+</div>
                <div className={styles.addLabel}>View All Items</div>
              </Link>
            </div>
          </div>

          {/* Recent Activity & Low Stock */}
          <div className={styles.twoColumnGrid}>
            {/* Recent Activity */}
            <div className={styles.activityCard}>
              <h3 className={styles.cardTitle}>Recent Activity</h3>
              <div className={styles.activityList}>
                {stocks.slice(-5).reverse().map((item, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>📦</div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityName}>{item.ItemName}</div>
                      <div className={styles.activityTime}>Added • Qty: {item.Quantity}</div>
                    </div>
                    <div className={styles.activityValue}>${Number(item.UnitPrice || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className={styles.activityCard}>
              <h3 className={styles.cardTitle}>Low Stock Alerts</h3>
              <div className={styles.activityList}>
                {stocks.filter(item => item.Quantity <= 10).slice(0, 5).map((item, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon} style={{ background: '#ffebee' }}>⚠️</div>
                    <div className={styles.activityDetails}>
                      <div className={styles.activityName}>{item.ItemName}</div>
                      <div className={styles.activityTime}>Quantity: {item.Quantity}</div>
                    </div>
                    <div className={styles.activityBadge}>Low</div>
                  </div>
                ))}
                {stocks.filter(item => item.Quantity <= 10).length === 0 && (
                  <div className={styles.emptyState}>No low stock items</div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar with Charts */}
        <aside className={styles.rightSidebar}>
          <div className={styles.popularSection}>
            <h3 className={styles.sidebarTitle}>Popular Items</h3>
            <div className={styles.popularStats}>
              <div className={styles.popularBadge} style={{ background: '#4caf50', color: '#fff' }}>
                {stats.recentlyAdded} added
              </div>
              <div className={styles.popularBadge} style={{ background: '#f44336', color: '#fff' }}>
                {stats.lowStock} low stock
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className={styles.chartContainer}>
              <div className={styles.barChart}>
                {[65, 45, 80, 55, 90, 40, 70].map((height, i) => (
                  <div key={i} className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{ height: `${height}%`, background: i === 4 ? '#4caf50' : '#e0e0e0' }}
                    ></div>
                    <div className={styles.barLabel}>
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Items List */}
          <div className={styles.topMaterialsSection}>
            <h3 className={styles.sidebarTitle}>Top Materials</h3>
            <div className={styles.materialsList}>
              {stocks.slice(0, 5).map((item, index) => (
                <div key={index} className={styles.materialItem}>
                  <div className={styles.materialRank}>{index + 1}</div>
                  <div className={styles.materialName}>{item.ItemName}</div>
                  <div className={styles.materialQty}>{item.Quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}