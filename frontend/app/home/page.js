// app/home/page.js
'use client';
import { useEffect, useState } from 'react';
import styles from '../page.module.css';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user')) || { name: 'Staff' };
    setUser(loggedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const features = [
    { title: 'Inbound Production Tracking', desc: 'Input production numbers for incoming stock.' },
    { title: 'Outbound Production Tracking', desc: 'Track outbound production numbers efficiently.' },
    { title: 'Stock Movement Monitoring', desc: 'Track movement transactions for traceability.' },
    { title: 'Stock Taking Capabilities', desc: 'Accurate inventory counting in real-time.' },
    { title: 'Comprehensive Reporting Tools', desc: 'Detailed analytics to support decision making.' },
    { title: 'Supervisor Access Features', desc: 'Ensure oversight and accuracy in stock management.' },
  ];

  return (
    <div className={styles.page}>
      {user && (
        <div className={styles.userSection}>
          <p>Welcome, {user.name}</p>
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        </div>
      )}

      <main className={styles.main}>
        <h1>Inventory Dashboard</h1>
        <div className={styles.cardContainer}>
          {features.map((f, i) => (
            <div key={i} className={styles.card}>
              <h2>{f.title}</h2>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
