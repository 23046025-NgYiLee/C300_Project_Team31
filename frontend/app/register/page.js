'use client'
import { useRef, useState } from 'react'
import styles from "../page.module.css"
import emailjs from '@emailjs/browser'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [messages, setMessages] = useState([])
  
  // Place useRef OUTSIDE handleSubmit, tied to the <form>
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
    const res = await fetch('http://localhost:4000/register', {
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
    console.error(err)
    setErrors(['Registration failed. Please try again'])
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
        <form ref={form} onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Email:</label>
            <input
              type="email"
              name="email" // Name here matches EmailJS template variables
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
              name="password" // Name here matches EmailJS template if needed
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
