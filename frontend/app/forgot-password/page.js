"use client";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import styles from "../page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    emailjs
      .sendForm(
        "service_75pbn7g",     // Your EmailJS Service ID
        "template_kneuvne",    // Your EmailJS Template ID
        form.current,          // Reference to the form
        "Wlqwf2LE5qFmZzMTR"    // Your Public Key
      )
      .then(
        (result) => {
          console.log(result.text);
          setMessage("Email sent successfully! Please check your inbox.");
          form.current.reset();
        },
        (error) => {
          console.error(error.text);
          setError("Failed to send email. Please try again.");
        }
      );
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

        <form
          ref={form}
          onSubmit={handleSubmit}
          style={{ width: "100%", maxWidth: "440px" }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label>Email Address:</label>
            <input
              type="email"
              name="email" // must match your EmailJS template variable name
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
            <button
              type="submit"
              className={`${styles.primary} ${styles.ctaButton}`}
            >
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
