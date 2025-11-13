"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// Import your generalstyle.css in your app layout, not here

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([result.message || "Login successful!"]);
        localStorage.setItem("user", JSON.stringify({
          email: result.email,
          userId: result.userId,
          role: result.role
        }));

        // Redirect based on user role
        if (result.role === "admin") router.push("/AdminDashboard");
        else if (result.role === "staff") router.push("/StaffDashboard");
        else router.push("/");
      } else {
        setErrors([result.error || "Invalid credentials."]);
      }
    } catch (err) {
      setErrors(["Something went wrong. Please try again later."]);
    }
  };

  return (
    <div className="page">
      <main className="main">
        <div className="intro">
          <h1>Welcome Back!</h1>
          <p>Please log in to access your account.</p>
        </div>
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
          <div className="ctas">
            <button type="submit" className="primary ctaButton">
              Login
            </button>
            <a href="/forgot-password" className="secondary">
              Forgot Password?
            </a>
            <a href="/register" className="secondary">
              Register Account
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
