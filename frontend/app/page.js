"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { API_BASE_URL } from "../config/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([result.message || "Login successful!"]);

        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify({
          email: result.email,
          userId: result.userId,
          role: result.role,
          name: result.name || email.split('@')[0]
        }));

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        // Redirect based on user role
        setTimeout(() => {
          if (result.role === "admin") router.push("/AdminDashboard");
          else if (result.role === "supervisor") router.push("/SupervisorDashboard");
          else if (result.role === "staff") router.push("/StaffDashboard");
          else router.push("/");
        }, 500);
      } else {
        setErrors([result.error || "Invalid credentials."]);
        setIsLoading(false);
      }
    } catch (err) {
      setErrors(["Something went wrong. Please try again later."]);
      setIsLoading(false);
    }
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

      {/* Right Side - Login Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Welcome Back</h2>
            <p>Please log in to access your account</p>

          </div>

          {/* Alerts */}
          {errors.length > 0 && (
            <div className={styles.errorAlert}>
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}
          {messages.length > 0 && (
            <div className={styles.successAlert}>
              {messages.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className={styles.formInput}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className={styles.formInput}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className={styles.forgotLink}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>Need help? Contact your administrator</p>
            <div style={{
              marginTop: "20px",
              padding: "16px",
              backgroundColor: "#f0f7ff",
              borderRadius: "8px",
              border: "1px solid #d0e7ff",
              textAlign: "center"
            }}>
              <p style={{ margin: "0 0 12px 0", color: "#2c3e50", fontWeight: "600" }}>
                🛍️ Customer Portal
              </p>
              <button
                type="button"
                onClick={() => router.push('/customer')}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#4caf50"}
              >
                Browse & Shop Products →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
