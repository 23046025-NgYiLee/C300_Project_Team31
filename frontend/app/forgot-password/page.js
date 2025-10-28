"use client";
import { useState } from "react";
import styles from "../page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || "Password reset link has been sent to your email!");
      } else {
        setError(result.error || "Unable to send reset link. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Forgot Password?</h1>
          <p>Enter your email address below and we’ll send you a reset link.</p>
        </div>

        {message && (
          <div style={{ color: "green", marginBottom: "16px" }}>{message}</div>
        )}
        {error && (
          <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label>Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginTop: "6px",
              }}
            />
          </div>

          <div className={styles.ctas}>
            <button type="submit" className={`${styles.primary} ${styles.ctaButton}`}>
              Send Reset Link
            </button>

            <a href="/login" className={styles.secondary}>
              Back to Login
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
