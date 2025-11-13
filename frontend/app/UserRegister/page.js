'use client'
import { useRef, useState } from 'react'
import styles from "../page.module.css"
import emailjs from '@emailjs/browser'

export default function Register() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState([])
  const [messages, setMessages] = useState([])
  const form = useRef()

  // Function to generate a random password
  const generatePassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setMessages([])

    // Generate random password automatically
    const randomPassword = generatePassword()

    // Append the generated password to the form data before sending
    form.current.password.value = randomPassword

    //  Send email via EmailJS
    emailjs.sendForm(
      'service_75pbn7g',       
      'template_e3gf5gt',      
      form.current,            
      'Wlqwf2LE5qFmZzMTR'      
    ).then(
      (result) => {
        console.log(result.text)
        setMessages([`Registration successful! Password has been emailed to ${email}.`])
        form.current.reset()
      },
      (error) => {
        console.error(error.text)
        setErrors(['Registration failed! Please try again.'])
      }
    )
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Create a Account for workers</h1>
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
              name="email" // Must match your EmailJS template variable
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

          {/* Hidden input for generated password */}
          <input type="hidden" name="password" />

          <div className={styles.ctas}>
            <button
              type="submit"
              className={`${styles.primary} ${styles.ctaButton}`}
            >
              Register
            </button>

            <a href="/AdminDashboard" className={styles.secondary}>
              Back to Dashboard
            </a>
          </div>
        </form>
      </main>
    </div>
  )
}
