"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import styles from "../login.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    emailjs
      .sendForm(
        "service_75pbn7g",      // EmailJS Service ID
        "template_kneuvne",     // EmailJS Template ID
        form.current,           // Reference to the form
        "Wlqwf2LE5qFmZzMTR"     // Public Key
      )
      .then(
        (result) => {
          setMessage("Email sent successfully! Please check your inbox.");
          setEmail("");
          setIsLoading(false);
        },
        (error) => {
          setError("Failed to send email. Please try again.");
          setIsLoading(false);
        }
      );
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Side - Branding */}
      <div className={styles.brandSide}>
        <div className={styles.brandContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📦</span>
            <h1 className={styles.brandTitle}>Inventory Pro</h1>
          </div>
          <p className={styles.brandSubtitle}>
            Professional Inventory Management System
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Real-time Stock Tracking</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Advanced Search & Filters</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Low Stock Alerts</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Comprehensive Reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a reset link</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className={styles.errorAlert}>
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className={styles.successAlert}>
              <p>{message}</p>
            </div>
          )}

          {/* Form */}
          <form ref={form} onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className={styles.formInput}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>
              Remember your password?{" "}
              <Link href="/" className={styles.forgotLink}>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
