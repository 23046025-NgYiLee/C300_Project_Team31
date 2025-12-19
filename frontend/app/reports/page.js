"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import styles from "../AdminDashboard/dashboard.module.css";

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState("accounts");

    // Accounts Reports data
    const [accountsReports, setAccountsReports] = useState([]);
    const [accountsStats, setAccountsStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        reportCount: 0
    });

    // Products Reports data
    const [productReports, setProductReports] = useState([]);
    const [products, setProducts] = useState([]);
    const [productStats, setProductStats] = useState({
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    });

    // Inventory Reports data
    const [inventoryReports, setInventoryReports] = useState([]);
    const [inventoryStats, setInventoryStats] = useState({
        totalItems: 0,
        recentChanges: 0
    });

    // Transaction Reports data
    const [transactionReports, setTransactionReports] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionStats, setTransactionStats] = useState({
        totalTransactions: 0,
        totalAmount: 0
    });

    const [loading, setLoading] = useState(true);

    // Fetch all data on mount
    useEffect(() => {
        setLoading(true);

        // Fetch Accounts Reports
        fetch('http://localhost:4000/api/accounts_reports')
            .then(res => res.json())
            .then(data => {
                setAccountsReports(data);
                const totalRevenue = data
                    .filter(r => r.reportDetails?.toLowerCase().includes('revenue') || r.reportDetails?.toLowerCase().includes('income'))
                    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
                const totalExpenses = data
                    .filter(r => r.reportDetails?.toLowerCase().includes('expense') || r.reportDetails?.toLowerCase().includes('cost'))
                    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
                setAccountsStats({
                    totalRevenue,
                    totalExpenses,
                    netIncome: totalRevenue - totalExpenses,
                    reportCount: data.length
                });
            })
            .catch(err => console.error("Error fetching accounts reports:", err));

        // Fetch Product Reports
        fetch('http://localhost:4000/api/product_reports')
            .then(res => res.json())
            .then(data => setProductReports(data))
            .catch(err => console.error("Error fetching product reports:", err));

        // Fetch Products/Stocks for Product Reports
        fetch('http://localhost:4000/api/stocks')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                const totalProducts = data.length;
                const inStock = data.filter(p => p.Quantity > 10).length;
                const lowStock = data.filter(p => p.Quantity > 0 && p.Quantity <= 10).length;
                const outOfStock = data.filter(p => p.Quantity === 0).length;
                setProductStats({ totalProducts, inStock, lowStock, outOfStock });
            })
            .catch(err => console.error("Error fetching products:", err));

        // Fetch Inventory Reports
        fetch('http://localhost:4000/api/inventory_reports')
            .then(res => res.json())
            .then(data => {
                setInventoryReports(data);
                setInventoryStats({
                    totalItems: data.length,
                    recentChanges: data.filter(r => {
                        const reportDate = new Date(r.reportDate);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return reportDate >= weekAgo;
                    }).length
                });
            })
            .catch(err => console.error("Error fetching inventory reports:", err));

        // Fetch Transaction Reports
        fetch('http://localhost:4000/api/transaction_reports')
            .then(res => res.json())
            .then(data => setTransactionReports(data))
            .catch(err => console.error("Error fetching transaction reports:", err));

        // Fetch Transactions
        fetch('http://localhost:4000/api/transactions')
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                const totalAmount = data.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                setTransactionStats({
                    totalTransactions: data.length,
                    totalAmount
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching transactions:", err);
                setLoading(false);
            });
    }, []);

    const tabs = [
        { id: "accounts", label: "Accounts Reports", icon: "💹" },
        { id: "products", label: "Product Reports", icon: "📈" },
        { id: "inventory", label: "Inventory Reports", icon: "📊" },
        { id: "transactions", label: "Transaction Reports", icon: "💳" }
    ];




    return (
        <DashboardLayout activePage="reports">
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Reports Dashboard</h2>
                <p style={{ color: "#666", marginTop: "8px" }}>
                    Access comprehensive reports to monitor and analyze your business operations
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "30px",
                borderBottom: "2px solid #e0e0e0",
                flexWrap: "wrap"
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "12px 24px",
                            border: "none",
                            background: activeTab === tab.id ? "#4e5dbdff" : "transparent",
                            color: activeTab === tab.id ? "white" : "#666",
                            borderRadius: "8px 8px 0 0",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            fontWeight: activeTab === tab.id ? "600" : "400",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Accounts Reports Tab */}
            {activeTab === "accounts" && (
                <div>
                    {/* Financial Stats Cards */}
                    <div className={styles.statsGrid} style={{ marginBottom: "30px" }}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💰</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Revenue</div>
                                <div className={styles.statValue}>${accountsStats.totalRevenue.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#ffebee' }}>📉</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Expenses</div>
                                <div className={styles.statValue}>${accountsStats.totalExpenses.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>📊</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Net Income</div>
                                <div className={styles.statValue} style={{ color: accountsStats.netIncome >= 0 ? '#4caf50' : '#f44336' }}>
                                    ${accountsStats.netIncome.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f3e5f5' }}>📋</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Reports</div>
                                <div className={styles.statValue}>{accountsStats.reportCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Activity Log */}
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        padding: "20px",
                        overflowX: "auto"
                    }}>
                        <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                            Financial Activity Log
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Report ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Account ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Date</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Category</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            Loading financial reports...
                                        </td>
                                    </tr>
                                ) : accountsReports.length > 0 ? (
                                    accountsReports.map((item) => {
                                        const isRevenue = item.reportDetails?.toLowerCase().includes('revenue') ||
                                            item.reportDetails?.toLowerCase().includes('income');
                                        const isExpense = item.reportDetails?.toLowerCase().includes('expense') ||
                                            item.reportDetails?.toLowerCase().includes('cost');

                                        return (
                                            <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                    #{item.reportID}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <span style={{
                                                        backgroundColor: "#e3f2fd",
                                                        color: "#1565c0",
                                                        padding: "4px 10px",
                                                        borderRadius: "4px",
                                                        fontSize: "0.85rem",
                                                        fontWeight: "500"
                                                    }}>
                                                        {item.accountID}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", color: "#666" }}>
                                                    {item.reportDate ? new Date(item.reportDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : "N/A"}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    {isRevenue ? (
                                                        <span style={{
                                                            backgroundColor: "#e8f5e9",
                                                            color: "#2e7d32",
                                                            padding: "4px 10px",
                                                            borderRadius: "4px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "500"
                                                        }}>
                                                            Revenue
                                                        </span>
                                                    ) : isExpense ? (
                                                        <span style={{
                                                            backgroundColor: "#ffebee",
                                                            color: "#c62828",
                                                            padding: "4px 10px",
                                                            borderRadius: "4px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "500"
                                                        }}>
                                                            Expense
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            backgroundColor: "#f5f5f5",
                                                            color: "#616161",
                                                            padding: "4px 10px",
                                                            borderRadius: "4px",
                                                            fontSize: "0.8rem",
                                                            fontWeight: "500"
                                                        }}>
                                                            General
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px", color: "#555", maxWidth: "400px" }}>
                                                    {item.reportDetails}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            No financial reports found. Start by adding account transactions.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Reports Tab */}
            {activeTab === "products" && (
                <div>
                    {/* Product Performance Stats Cards */}
                    <div className={styles.statsGrid} style={{ marginBottom: "30px" }}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>📦</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Products</div>
                                <div className={styles.statValue}>{productStats.totalProducts}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>✓</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>In Stock</div>
                                <div className={styles.statValue}>{productStats.inStock}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fff3e0' }}>⚠️</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Low Stock</div>
                                <div className={styles.statValue}>{productStats.lowStock}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#ffebee' }}>✕</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Out of Stock</div>
                                <div className={styles.statValue}>{productStats.outOfStock}</div>
                            </div>
                        </div>
                    </div>

                    {/* Product Inventory Status Table */}
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        padding: "20px",
                        marginBottom: "30px",
                        overflowX: "auto"
                    }}>
                        <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                            Current Inventory Status
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Product ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Product Name</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Category</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Quantity</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Status</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            Loading product inventory...
                                        </td>
                                    </tr>
                                ) : products.length > 0 ? (
                                    products.map((product) => {
                                        const quantity = product.Quantity || 0;
                                        let status = "In Stock";
                                        let statusColor = "#e8f5e9";
                                        let statusTextColor = "#2e7d32";

                                        if (quantity === 0) {
                                            status = "Out of Stock";
                                            statusColor = "#ffebee";
                                            statusTextColor = "#c62828";
                                        } else if (quantity <= 10) {
                                            status = "Low Stock";
                                            statusColor = "#fff3e0";
                                            statusTextColor = "#e65100";
                                        }

                                        return (
                                            <tr key={product.ItemID} style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                    <span style={{
                                                        backgroundColor: "#f3e5f5",
                                                        color: "#7b1fa2",
                                                        padding: "4px 10px",
                                                        borderRadius: "4px",
                                                        fontSize: "0.85rem",
                                                        fontWeight: "500"
                                                    }}>
                                                        #{product.ItemID}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", color: "#333", fontWeight: "500" }}>
                                                    {product.ItemName}
                                                </td>
                                                <td style={{ padding: "12px", color: "#666" }}>
                                                    {product.ItemCategory || "N/A"}
                                                </td>
                                                <td style={{ padding: "12px", color: "#333", fontWeight: "600" }}>
                                                    {quantity}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <span style={{
                                                        backgroundColor: statusColor,
                                                        color: statusTextColor,
                                                        padding: "4px 10px",
                                                        borderRadius: "4px",
                                                        fontSize: "0.8rem",
                                                        fontWeight: "500"
                                                    }}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px", color: "#333" }}>
                                                    ${parseFloat(product.UnitPrice || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            No products found in inventory.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Product Activity Log */}
                    {productReports.length > 0 && (
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            padding: "20px",
                            overflowX: "auto"
                        }}>
                            <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                                Product Activity Log
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Report ID</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Product ID</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Date</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Activity Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productReports.map((item) => (
                                        <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                #{item.reportID}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
                                                    backgroundColor: "#f3e5f5",
                                                    color: "#7b1fa2",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500"
                                                }}>
                                                    #{item.productID}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", color: "#666" }}>
                                                {item.reportDate ? new Date(item.reportDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : "N/A"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#555", maxWidth: "400px" }}>
                                                {item.reportDetails}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Inventory Reports Tab */}
            {activeTab === "inventory" && (
                <div>
                    {/* Inventory Stats Cards */}
                    <div className={styles.statsGrid} style={{ marginBottom: "30px" }}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>📊</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Reports</div>
                                <div className={styles.statValue}>{inventoryStats.totalItems}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fff3e0' }}>📅</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Recent Changes (7 days)</div>
                                <div className={styles.statValue}>{inventoryStats.recentChanges}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>📦</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Stock Items</div>
                                <div className={styles.statValue}>{products.length}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f3e5f5' }}>🔄</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Movement Tracking</div>
                                <div className={styles.statValue}>Active</div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Movement Reports */}
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        padding: "20px",
                        overflowX: "auto"
                    }}>
                        <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                            Inventory Level & Movement Reports
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Report ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Inventory ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Date</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Movement Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            Loading inventory reports...
                                        </td>
                                    </tr>
                                ) : inventoryReports.length > 0 ? (
                                    inventoryReports.map((item) => (
                                        <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                #{item.reportID}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
                                                    backgroundColor: "#e0f2f1",
                                                    color: "#00695c",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500"
                                                }}>
                                                    Item #{item.inventoryID}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", color: "#666" }}>
                                                {item.reportDate ? new Date(item.reportDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : "N/A"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#555", maxWidth: "400px" }}>
                                                {item.reportDetails}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            No inventory movement reports found. Reports will appear here when inventory levels change.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transaction Reports Tab */}
            {activeTab === "transactions" && (
                <div>
                    {/* Transaction Stats Cards */}
                    <div className={styles.statsGrid} style={{ marginBottom: "30px" }}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e3f2fd' }}>💳</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Transactions</div>
                                <div className={styles.statValue}>{transactionStats.totalTransactions}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#e8f5e9' }}>💰</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Total Amount</div>
                                <div className={styles.statValue}>${transactionStats.totalAmount.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f3e5f5' }}>📋</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Reports Generated</div>
                                <div className={styles.statValue}>{transactionReports.length}</div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#fff3e0' }}>📊</div>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Average Transaction</div>
                                <div className={styles.statValue}>
                                    ${transactions.length > 0 ? (transactionStats.totalAmount / transactions.length).toFixed(2) : '0.00'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Table */}
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        padding: "20px",
                        marginBottom: "30px",
                        overflowX: "auto"
                    }}>
                        <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                            Transaction History
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Transaction ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Account ID</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Date & Time</th>
                                    <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((item) => (
                                        <tr key={item.transactionID} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                #{item.transactionID}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
                                                    backgroundColor: "#e3f2fd",
                                                    color: "#1565c0",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500"
                                                }}>
                                                    {item.accountID}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", color: "#666" }}>
                                                {item.transactionDate ? new Date(item.transactionDate).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : "N/A"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#2e7d32", fontWeight: "600" }}>
                                                ${parseFloat(item.amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Transaction Reports */}
                    {transactionReports.length > 0 && (
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            padding: "20px",
                            overflowX: "auto"
                        }}>
                            <h3 style={{ color: "#4e5dbdff", marginBottom: "20px", fontSize: "1.3rem" }}>
                                Transaction Analysis Reports
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #4e5dbdff" }}>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Report ID</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Transaction ID</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Report Date</th>
                                        <th style={{ textAlign: "left", padding: "12px", color: "#4e5dbdff", fontWeight: "600" }}>Analysis Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactionReports.map((item) => (
                                        <tr key={item.reportID} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px", fontWeight: "bold", color: "#333" }}>
                                                #{item.reportID}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{
                                                    backgroundColor: "#fce4ec",
                                                    color: "#c2185b",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.85rem",
                                                    fontWeight: "500"
                                                }}>
                                                    Trans #{item.transactionID}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", color: "#666" }}>
                                                {item.reportDate ? new Date(item.reportDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : "N/A"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#555", maxWidth: "400px" }}>
                                                {item.reportDetails}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
