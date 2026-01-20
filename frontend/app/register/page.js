'use client'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import styles from '../auth.module.css'
import { API_BASE_URL } from '../config/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [messages, setMessages] = useState([])
  const form = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessages([])

    if (!email || !password) {
      setErrors(['Email and password are required'])
      return
    }

    try {
      // 1. Register user in backend
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors([data.error || 'Registration failed'])
        return
      }

      // 2. Send confirmation email via EmailJS
      try {
        await emailjs.sendForm(
          'service_75pbn7g',
          'template_e3gf5gt',
          form.current,
          'Wlqwf2LE5qFmZzMTR'
        )
        setMessages(['Registration Successful! Email sent.'])
        form.current.reset()
        setEmail('')
        setPassword('')
      } catch (emailErr) {
        setErrors(['Registration succeeded, but email failed'])
      }

    } catch (err) {
      setErrors(['Registration failed. Please try again'])
    }
  }

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.intro}>
            <h1>Create Your Account</h1>
            <p>Sign up to access all features.</p>
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

          {/* Registration Form */}
          <form ref={form} onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.formInput}
              />
            </div>
            <div className={styles.ctas}>
              <button type="submit" className={`${styles.ctaButton} ${styles.primary}`}>
                Register
              </button>
              <a href="/login" className={`${styles.ctaButton} ${styles.secondary}`}>
                Already have an account?
              </a>
            </div>
          </form>
        </main>
      </div>
    </>

  )
}
