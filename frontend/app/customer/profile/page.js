'use client';

import { useState, useEffect } from 'react';
import CustomerLayout from '../../partials/CustomerLayout';
import Link from 'next/link';
import styles from '../../AdminDashboard/dashboard.module.css';

export default function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Load customer data from localStorage
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      const customerData = JSON.parse(storedCustomer);
      setCustomer(customerData);
      setFormData({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        zipCode: customerData.zipCode || '',
        country: customerData.country || 'USA'
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Update customer data in localStorage
    const updatedCustomer = {
      ...customer,
      ...formData
    };

    localStorage.setItem('customer', JSON.stringify(updatedCustomer));
    setCustomer(updatedCustomer);
    setIsEditing(false);
    setMessage('Profile updated successfully!');

    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // In a real application, you would send this to the backend
    setMessage('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPassword(false);

    setTimeout(() => setMessage(''), 3000);
  };

  if (!customer || customer.isGuest) {
    return (
      <CustomerLayout activePage="profile">
        <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>👤</div>
          <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Guest Profile</h1>
          <p style={{ color: '#546e7a', fontSize: '1.2rem', marginBottom: '2rem' }}>
            You are currently browsing as a guest. Create an account to save your profile details, track orders, and faster checkout!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/customer-register" className={styles.newRequestBtn} style={{ textDecoration: 'none', padding: '12px 30px' }}>
              Create Account
            </Link>
            <Link href="/customer-login" className={styles.newRequestBtn} style={{ textDecoration: 'none', padding: '12px 30px', backgroundColor: '#546e7a' }}>
              Login
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>My Profile</h1>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            borderRadius: '4px',
            border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Profile Information */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to current customer data
                    setFormData({
                      name: customer.name || '',
                      email: customer.email || '',
                      phone: customer.phone || '',
                      address: customer.address || '',
                      city: customer.city || '',
                      state: customer.state || '',
                      zipCode: customer.zipCode || '',
                      country: customer.country || 'USA'
                    });
                  }}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: '#777', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Full Name
                </label>
                <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>
                  {customer.name || 'Not provided'}
                </p>
              </div>

              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: '#777', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>
                  {customer.email || 'Not provided'}
                </p>
              </div>

              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: '#777', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>
                  {customer.phone || 'Not provided'}
                </p>
              </div>

              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem' }}>
                <label style={{ display: 'block', color: '#777', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Address
                </label>
                <p style={{ margin: 0, color: '#333', fontSize: '1rem' }}>
                  {customer.address ? (
                    <>
                      {customer.address}<br />
                      {customer.city && `${customer.city}, `}
                      {customer.state && `${customer.state} `}
                      {customer.zipCode && customer.zipCode}<br />
                      {customer.country || 'USA'}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>Password</h2>
            {!showPassword && (
              <button
                onClick={() => setShowPassword(true)}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Change Password
              </button>
            )}
          </div>

          {showPassword ? (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                  <small style={{ color: '#777', fontSize: '0.85rem' }}>
                    Password must be at least 6 characters long
                  </small>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p style={{ color: '#666', margin: 0 }}>
              •••••••••••• (Last changed: Never)
            </p>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
