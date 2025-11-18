import Link from "next/link";

<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark"
      style={{
        background: "black",
        borderBottom: "4px solid burlywood",
        borderRadius: "0 0 14px 14px",
        minHeight: "60px"
      }}
      id="navbar">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand" id="Flower-navbar-title">
          Inventory Management System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="collapsibleNavbar">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className="nav-link" id="homebartext">Home</Link>
            </li>
            <li className="nav-item">
              <Link href="/stocklist" className="nav-link" id="listbartext">Stock List</Link>
            </li>
            <li className="nav-item">
              <Link href="/addstocks" className="nav-link" id="custombartext">Add Stock</Link>
            </li>
            <li className="nav-item">
              <Link href="/editstock" className="nav-link" id="custombartext">Edit Stock</Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
