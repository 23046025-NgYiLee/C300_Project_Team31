"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "../AdminDashboard/dashboard.module.css";
import { API_BASE_URL } from "../../config/api";

export default function CustomerLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("customer", JSON.stringify({
                    ...data,
                    isGuest: false
                }));
                window.location.href = "/customer";
            } else {
                setError(data.error || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Connection error. Please check your internet.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f7fa'
        }}>
            <div className={styles.activityCard} style={{ maxWidth: '400px', width: '90%', padding: '40px' }}>
                <h2 className={styles.pageTitle} style={{ textAlign: 'center', marginBottom: '10px' }}>Customer Login 🛍️</h2>
                <p style={{ textAlign: 'center', color: '#78909c', marginBottom: '30px' }}>Welcome back! Please login to your account.</p>

                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className={styles.searchInput}
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className={styles.searchInput}
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.newRequestBtn}
                        style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '20px' }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#546e7a' }}>
                    Don't have an account? <Link href="/customer-register" style={{ color: '#1976d2', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    <Link href="/customer" style={{ color: '#78909c', textDecoration: 'none' }}>← Back to Guest Shop</Link>
                </div>
            </div>
        </div>
    );
}
