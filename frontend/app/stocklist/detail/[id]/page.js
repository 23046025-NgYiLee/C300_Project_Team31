"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './detail.module.css';
import dashboardStyles from '../../../AdminDashboard/dashboard.module.css';
import DashboardLayout from '../../../partials/DashboardLayout';
import { API_BASE_URL } from '../../../../config/api';

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const itemId = params.id;

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!itemId) return;

        fetch(`${API_BASE_URL}/api/stocks/${itemId}`)
            .then(res => {
                if (!res.ok) throw new Error('Item not found');
                return res.json();
            })
            .then(data => {
                setItem(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [itemId]);

    if (loading) {
        return (
            <DashboardLayout activePage="stock">
                <div className={styles.loadingContainer}>
                    <div className={styles.loading}>Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !item) {
        return (
            <DashboardLayout activePage="stock">
                <div className={styles.errorContainer}>
                    <h2>Item Not Found</h2>
                    <p>{error || 'The requested item could not be found.'}</p>
                    <button onClick={() => router.push('/stocklist')} className={dashboardStyles.newRequestBtn}>
                        ← Back to Stock List
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activePage="stock">
            {/* Page Header */}
            <div className={dashboardStyles.pageHeader}>
                <div>
                    <h2 className={dashboardStyles.pageTitle}>Stock Details</h2>
                    <p style={{ color: '#78909c', marginTop: '8px' }}>
                        Complete information for {item.ItemName}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/stocklist')}
                    className={dashboardStyles.newRequestBtn}
                    style={{ backgroundColor: '#6c757d' }}
                >
                    ← Back to List
                </button>
            </div>

            <div className={styles.detailContainer}>
                {/* Main Info Card */}
                <div className={styles.mainCard}>
                    <div className={styles.imageSection}>
                        <div className={styles.imageWrapper}>
                            <img
                                src={`${API_BASE_URL}/images/${item.ImagePath || 'placeholder.png'}`}
                                alt={item.ItemName}
                                className={styles.productImage}
                                onError={(e) => { e.target.src = `${API_BASE_URL}/images/placeholder.png` }}
                            />
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.itemHeader}>
                            <h1 className={styles.itemName}>{item.ItemName}</h1>
                            <div className={styles.stockBadge}>
                                {item.Quantity > 10 ? (
                                    <span className={styles.inStock}>In Stock</span>
                                ) : item.Quantity > 0 ? (
                                    <span className={styles.lowStock}>Low Stock</span>
                                ) : (
                                    <span className={styles.outOfStock}>Out of Stock</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.quickStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Quantity</span>
                                <span className={styles.statValue}>{item.Quantity}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Unit Price</span>
                                <span className={styles.statValue}>${Number(item.UnitPrice).toFixed(2)}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Total Value</span>
                                <span className={styles.statValue}>
                                    ${(item.Quantity * item.UnitPrice).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className={styles.detailsGrid}>
                    {/* Product Information */}
                    <div className={styles.detailCard}>
                        <h3 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📦</span>
                            Product Information
                        </h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{item.Brand || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Class:</span>
                            <span className={styles.value}>{item.ItemClass || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Type:</span>
                            <span className={styles.value}>{item.ItemType || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Category:</span>
                            <span className={styles.value}>{item.ItemCategory || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Inventory Details */}
                    <div className={styles.detailCard}>
                        <h3 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📊</span>
                            Inventory Details
                        </h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Current Stock:</span>
                            <span className={styles.value}>{item.Quantity} units</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Unit Price:</span>
                            <span className={styles.value}>${Number(item.UnitPrice).toFixed(2)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Total Value:</span>
                            <span className={styles.value}>
                                ${(item.Quantity * item.UnitPrice).toFixed(2)}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Supplier:</span>
                            <span className={styles.value}>{item.Supplier || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Dates & Timeline */}
                    <div className={styles.detailCard}>
                        <h3 className={styles.cardTitle}>
                            <span className={styles.cardIcon}>📅</span>
                            Dates & Timeline
                        </h3>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Date Added:</span>
                            <span className={styles.value}>
                                {item.DateAdded ? new Date(item.DateAdded).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Last Updated:</span>
                            <span className={styles.value}>
                                {item.LastUpdated ? new Date(item.LastUpdated).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Image:</span>
                            <span className={styles.value}>{item.ImagePath || 'placeholder.png'}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <button
                        onClick={() => router.push(`/editstock?id=${item.ItemID}`)}
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                    >
                        ✏️ Edit Item
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this item?')) {
                                fetch(`${API_BASE_URL}/api/stocks/${item.ItemID}`, {
                                    method: 'DELETE'
                                })
                                    .then(() => router.push('/stocklist'))
                                    .catch(err => alert('Failed to delete item'));
                            }
                        }}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                        🗑️ Delete Item
                    </button>
                </div>
            </div>
        </DashboardLayout >
    );
}
