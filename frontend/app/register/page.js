'use client'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
// import '../generalstyle.css'; // Import globally in app/layout.js, not in every page

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
      setErrors(['Registration failed. Please try again'])
    }
  }

  return (
    <>
      <div className="page">
        <main className="main">
          <div className="intro">
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
              <label>Password:</label>
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
            <div className="ctas">
              <button type="submit" className="primary ctaButton">
                Register
              </button>
              <a href="/login" className="secondary">
                Already have an account?
              </a>
            </div>
          </form>
        </main>
      </div>
    </>
    
  )
}
