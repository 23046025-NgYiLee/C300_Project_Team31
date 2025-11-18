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
     
          >
            Forgot Password?
          </a>
          <a
            className="secondary"
            href="/AdminDashboard"
         
          >
            test board?
          </a>
       
        </div>
      </main>
    </div>
  );
}
