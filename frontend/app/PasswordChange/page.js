'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../login.module.css'



export default function PasswordChange() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [messages, setMessages] = useState([])
  const form = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessages([])

    if (!email || !password || !confirmPassword) {
      setErrors(['All fields are required.'])
      return
    }

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match.'])
      return
    }

    try {
      const res = await fetch('http://localhost:4000/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors([data.error || 'Password change failed.'])
        return
      }

      setMessages(['Password has been successfully changed!'])
      form.current.reset()
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/'), 3000)

    } catch (err) {
      console.error(err)
      setErrors(['Password change failed. Please try again.'])
    }
  }

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

      {/* Right Side - Password Change Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Reset Your Password</h2>
            <p>Enter your email and a new password to update your account.</p>
          </div>

          {/* Alerts */}
          {errors.length > 0 && (
            <div className={styles.errorAlert}>
              {errors.map((error, i) => <p key={i}>{error}</p>)}
            </div>
          )}
          {messages.length > 0 && (
            <div className={styles.successAlert}>
              {messages.map((msg, i) => <p key={i}>{msg}</p>)}
            </div>
          )}

          {/* Password Change Form */}
          <form ref={form} onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.formInput}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
                placeholder="Enter new password"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.formInput}
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className={styles.loginBtn}>
              Change Password
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
  )
}
