import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "#22223b",
        borderBottom: "3px solid #9a8c98",
        borderRadius: "0 0 16px 16px",
        minHeight: "64px",
        boxShadow: "0 2px 8px rgba(74, 78, 105, 0.25)",
      }}
      id="navbar"
    >
      <div className="container-fluid">
        <Link href="/" className="navbar-brand" id="Flower-navbar-title" style={{ color: "#f2e9e4", fontWeight: 700 }}>
          Inventory Management System
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapsibleNavbar"
          aria-controls="collapsibleNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="collapsibleNavbar">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                href="/"
                className="nav-link"
                id="homebartext"
                style={{ color: "#f2e9e4", fontWeight: 500 }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/stocklist"
                className="nav-link"
                id="listbartext"
                style={{ color: "#f2e9e4", fontWeight: 500 }}
              >
                Stock List
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/addstocks"
                className="nav-link"
                id="custombartext"
                style={{ color: "#f2e9e4", fontWeight: 500 }}
              >
                Add Stock
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/editstock"
                className="nav-link"
                id="editbartext"
                style={{ color: "#f2e9e4", fontWeight: 500 }}
              >
                Edit Stock
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
