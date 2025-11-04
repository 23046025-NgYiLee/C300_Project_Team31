
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
       
        <div className={styles.intro}>
          <h1>To get started with management please login.</h1>
         
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/login"
          >Login</a>

          <a
            className={styles.secondary}
            href="/forgot-password"
            target="_blank"
            rel="noopener noreferrer"
          >
            Forgot Password?
          </a>
          <a
            className={styles.secondary}
            href="/AdminDashboard"
            rel="noopener noreferrer"
          >
            test board?
          </a>

              <a
            className={styles.secondary}
            href="/register"
            rel="noopener noreferrer"
          >
            Register Account
          </a>
        </div>
      </main>
    </div>
  );
}