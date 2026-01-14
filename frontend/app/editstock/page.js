"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DashboardLayout from '../partials/DashboardLayout';
import styles from '../auth.module.css';
import dashboardStyles from '../AdminDashboard/dashboard.module.css';

function EditStockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    brand: '',
    ItemClass: '',
    type: '',
    category: '',
    supplier: '',
    unitPrice: '',
    imagePath: ''
  });

  // Fetch item data
  useEffect(() => {
    if (!itemId) {
      setError('No item ID provided');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:4000/api/stocks/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error('Item not found');
        return res.json();
      })
      .then(data => {
        setFormData({
          name: data.ItemName || '',
          quantity: data.Quantity || '',
          brand: data.Brand || '',
          ItemClass: data.ItemClass || '',
          type: data.ItemType || '',
          category: data.ItemCategory || '',
          supplier: data.Supplier || '',
          unitPrice: data.UnitPrice || '',
          imagePath: data.ImagePath || ''
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [itemId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://localhost:4000/api/stocks/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          quantity: formData.quantity,
          brand: formData.brand,
          ItemClass: formData.ItemClass,
          type: formData.type,
          category: formData.category,
          supplier: formData.supplier,
          unitPrice: formData.unitPrice,
          imagePath: formData.imagePath
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update stock');
      }

      setSuccess('Stock updated successfully!');
      setTimeout(() => {
        router.push(`/stocklist/detail/${itemId}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activePage="stock">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !formData.name) {
    return (
      <DashboardLayout activePage="stock">
        <div className={dashboardStyles.pageHeader}>
          <h2 className={dashboardStyles.pageTitle}>Error</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#f44336', fontSize: '1.1rem' }}>{error}</p>
          <button
            onClick={() => router.push('/stocklist')}
            className={dashboardStyles.newRequestBtn}
            style={{ marginTop: '20px' }}
          >
            ← Back to Stock List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="stock">
      <div className={dashboardStyles.pageHeader}>
        <div>
          <h2 className={dashboardStyles.pageTitle}>Edit Stock</h2>
          <p style={{ color: '#78909c', marginTop: '8px' }}>
            Update information for {formData.name}
          </p>
        </div>
        <button
          onClick={() => router.push(`/stocklist/detail/${itemId}`)}
          className={dashboardStyles.newRequestBtn}
          style={{ backgroundColor: '#6c757d' }}
        >
          ← Cancel
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {error && (
            <div className={styles.errorAlert} style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          {success && (
            <div className={styles.successAlert} style={{ marginBottom: '20px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label>Stock Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Class *</label>
                <input
                  type="text"
                  name="ItemClass"
                  value={formData.ItemClass}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Supplier *</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Unit Price *</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Image Filename (optional)</label>
                <input
                  type="text"
                  name="imagePath"
                  value={formData.imagePath}
                  onChange={handleChange}
                  placeholder="e.g., product.jpg"
                  className={styles.formInput}
                />
                <small style={{ color: '#78909c', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  Image should be in backend/public/images folder
                </small>
              </div>
            </div>

            <div className={styles.ctas} style={{ marginTop: '24px' }}>
              <button type="submit" className={`${styles.ctaButton} ${styles.primary}`}>
                💾 Update Stock
              </button>
              <button
                type="button"
                onClick={() => router.push(`/stocklist/detail/${itemId}`)}
                className={`${styles.ctaButton} ${styles.secondary}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function EditStockPage() {
  return (
    <Suspense fallback={
      <DashboardLayout activePage="stock">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    }>
      <EditStockContent />
    </Suspense>
  );
}
