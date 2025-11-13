import './generalstyle.css';

export default function Home() {
  return (
    <div className="page">
      <main className="main">
        <div className="intro">
          <h1>To get started with management please login.</h1>
        </div>
        <div className="ctas">
          <a className="primary" href="/login">
            Login
          </a>
          <a
            className="secondary"
            href="/forgot-password"
            target="_blank"
            rel="noopener noreferrer"
          >
            Forgot Password?
          </a>
          <a
            className="secondary"
            href="/AdminDashboard"
            rel="noopener noreferrer"
          >
            test board?
          </a>
          <a
            className="secondary"
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
  