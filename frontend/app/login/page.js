"use client";
import { useState } from "react";
import styles from "../page.module.css"; // using your existing styling

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([result.message || "Login successful!"]);
     
      } else {
        setErrors([result.error || "Invalid credentials."]);
      }
    } catch (err) {
      setErrors(["Something went wrong. Please try again later."]);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Welcome Back!</h1>
          <p>Please log in to access your account.</p>
        </div>

        {/* Alerts */}
        {errors.length > 0 && (
          <div style={{ color: "red", marginBottom: "16px" }}>
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
        {messages.length > 0 && (
          <div style={{ color: "green", marginBottom: "16px" }}>
            {messages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label>Email:</label>
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

          <div style={{ marginBottom: "16px" }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Login
            </button>

            <a href="/forgot-password" className={styles.secondary}>
              Forgot Password?
            </a>

            <a href="/register" className={styles.secondary}>
              Register Account
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
