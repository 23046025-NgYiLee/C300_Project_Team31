'use client'
import { useState } from 'react'
import styles from "../page.module.css"

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [messages, setMessages] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessages([])

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessages([result.message || 'Registration successful!'])
        // optionally redirect after registration
        // window.location.href = '/login'
      } else {
        setErrors([result.error || 'Registration failed.'])
      }
    } catch (err) {
      setErrors(['Something went wrong. Please try again later.'])
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Create Your Account</h1>
          <p>Sign up to access all features.</p>
        </div>

        {/* Alerts */}
        {errors.length > 0 && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {errors.map((error, i) => <p key={i}>{error}</p>)}
          </div>
        )}
        {messages.length > 0 && (
          <div style={{ color: 'green', marginBottom: '16px' }}>
            {messages.map((msg, i) => <p key={i}>{msg}</p>)}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginTop: '6px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginTop: '6px',
              }}
            />
          </div>

          <div className={styles.ctas}>
            <button type="submit" className={`${styles.primary} ${styles.ctaButton}`}>
              Register
            </button>

            <a href="/login" className={styles.secondary}>
              Already have an account?
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
