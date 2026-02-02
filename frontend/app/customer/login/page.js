"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../login.module.css";
import { API_BASE_URL } from "../../../config/api";
import { sendWelcomeEmail } from "../../../utils/emailService";

export default function CustomerLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if customer is already logged in
    const customer = localStorage.getItem("customer");
    if (customer) {
      router.push("/customer");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([result.message || "Login successful!"]);

        // Save customer data to localStorage
        localStorage.setItem("customer", JSON.stringify({
          email: result.email,
          name: result.name,
          customerId: result.customerId
        }));

        // Redirect to customer dashboard
        setTimeout(() => {
          router.push("/customer");
        }, 1000);
      } else {
        setErrors([result.error || "Invalid credentials."]);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors(["Something went wrong. Please try again later."]);
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);
    setIsLoading(true);

    if (!name || !email || !password) {
      setErrors(["All fields are required"]);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrors(["Password must be at least 6 characters"]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages(["Registration successful! Logging you in..."]);

        // Save customer data to localStorage
        localStorage.setItem("customer", JSON.stringify({
          email: result.email,
          name: result.name,
          customerId: result.customerId
        }));

        // Send welcome email
        try {
          await sendWelcomeEmail({
            customerName: result.name,
            customerEmail: result.email
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
          // Don't block registration if email fails
        }

        // Redirect to customer dashboard
        setTimeout(() => {
          router.push("/customer");
        }, 1500);
      } else {
        setErrors([result.error || "Registration failed."]);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
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
            <span className={styles.logoIcon}>🛒</span>
            <h1 className={styles.brandTitle}>Customer Portal</h1>
          </div>
          <p className={styles.brandSubtitle}>
            Shop our inventory and manage your orders
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Browse Available Products</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Easy Checkout Process</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Track Your Orders</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Order History</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p>{isLogin ? "Log in to your customer account" : "Sign up to start shopping"}</p>
          </div>

          {/* Toggle Tabs */}
          <div style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            borderBottom: "2px solid #e0e0e0"
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                background: isLogin ? "#4e5dbdff" : "transparent",
                color: isLogin ? "white" : "#666",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: isLogin ? "600" : "400",
                transition: "all 0.3s ease"
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                background: !isLogin ? "#4e5dbdff" : "transparent",
                color: !isLogin ? "white" : "#666",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: !isLogin ? "600" : "400",
                transition: "all 0.3s ease"
              }}
            >
              Register
            </button>
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
          {isLogin ? (
            <form onSubmit={handleLogin} className={styles.loginForm}>
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

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className={styles.formInput}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reg-email">Email Address</label>
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className={styles.formInput}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reg-password">Password</label>
                <input
                  type="password"
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password (min 6 characters)"
                  className={styles.formInput}
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <a
              href="/"
              style={{
                color: "#4e5dbdff",
                textDecoration: "none",
                fontSize: "0.9rem"
              }}
            >
              ← Back to Staff Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
