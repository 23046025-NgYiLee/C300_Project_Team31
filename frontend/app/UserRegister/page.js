'use client';
import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import Link from 'next/link';
import styles from './register.module.css';

export default function UserRegister() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState([]);
  const [messages, setMessages] = useState([]);
  const form = useRef();

  // Function to generate a random password
  const generatePassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessages([]);

    // Generate random password automatically
    const randomPassword = generatePassword();

    // Append the generated password to the form data before sending
    form.current.password.value = randomPassword;

    // Send email via EmailJS
    emailjs.sendForm(
      'service_75pbn7g',
      'template_e3gf5gt',
      form.current,
      'Wlqwf2LE5qFmZzMTR'
    ).then(
      (result) => {
        setMessages([`Registration successful! Password has been emailed to ${email}.`]);
        setEmail('');
        form.current.reset();
      },
      (error) => {
        setErrors(['Registration failed! Please try again.']);
      }
    );
  };

  return (
    <div className={styles.dashboardPage}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.brandSection}>
          <h1 className={styles.brandName}>Inventory Pro</h1>
        </div>
        <div className={styles.userSection}>
          <Link href="/AdminDashboard" className={styles.backBtn}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <Link href="/AdminDashboard" className={styles.navItem}>
              <span className={styles.navIcon}>📊</span>
              Dashboard
            </Link>
            <Link href="/stocklist" className={styles.navItem}>
              <span className={styles.navIcon}>📦</span>
              Stock
            </Link>
            <Link href="/UserRegister" className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navIcon}>👥</span>
              User Management
            </Link>
            <div className={styles.navItem}>
              <span className={styles.navIcon}>📋</span>
              Reports
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>User Registration</h2>
          </div>

          {/* Registration Card */}
          <div className={styles.registerCard}>
            <div className={styles.cardHeader}>
              <h3>Create New Worker Account</h3>
              <p>Enter the worker's email address to send them registration credentials</p>
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
            <form ref={form} onSubmit={handleSubmit} className={styles.registerForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="worker@example.com"
                  className={styles.formInput}
                />
                <small className={styles.formHelp}>
                  A randomly generated password will be sent to this email address
                </small>
              </div>

              {/* Hidden input for generated password */}
              <input type="hidden" name="password" />

              <div className={styles.formActions}>
                <Link href="/AdminDashboard" className={styles.cancelBtn}>
                  Cancel
                </Link>
                <button type="submit" className={styles.submitBtn}>
                  Send Registration Email
                </button>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoContent}>
              <h4>How it works</h4>
              <ul>
                <li>Enter the worker's email address</li>
                <li>A secure random password will be automatically generated</li>
                <li>Registration credentials will be sent to the provided email</li>
                <li>The worker can log in with the provided credentials</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
