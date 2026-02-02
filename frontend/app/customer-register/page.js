"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "../AdminDashboard/dashboard.module.css";
import { API_BASE_URL } from "../../config/api";

export default function CustomerRegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/customer/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = "/customer-login";
                }, 2000);
            } else {
                setError(data.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
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
            <div className={styles.activityCard} style={{ maxWidth: '450px', width: '90%', padding: '40px' }}>
                <h2 className={styles.pageTitle} style={{ textAlign: 'center', marginBottom: '10px' }}>Join Us! 📝</h2>
                <p style={{ textAlign: 'center', color: '#78909c', marginBottom: '30px' }}>Create an account to track your orders.</p>

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

                {success && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        Registration successful! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2c3e50' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className={styles.searchInput}
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2c3e50' }}>Email Address</label>
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

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2c3e50' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                            minLength={6}
                            className={styles.searchInput}
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#2c3e50' }}>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            className={styles.searchInput}
                            style={{ width: '100%', padding: '12px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className={styles.newRequestBtn}
                        style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '20px' }}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#546e7a' }}>
                    Already have an account? <Link href="/customer-login" style={{ color: '#1976d2', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
                </div>
            </div>
        </div>
    );
}
