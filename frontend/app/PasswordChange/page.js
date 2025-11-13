'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import '../generalstyle.css';



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
      setTimeout(() => router.push('/login'), 3000)

    } catch (err) {
      console.error(err)
      setErrors(['Password change failed. Please try again.'])
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Reset Your Password</h1>
          <p>Enter your email and a new password to update your account.</p>
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

        {/* Password Change Form */}
        <form ref={form} onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
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
            <label>New Password:</label>
            <input
              type="password"
              name="password"
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

          <div style={{ marginBottom: '16px' }}>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Change Password
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
