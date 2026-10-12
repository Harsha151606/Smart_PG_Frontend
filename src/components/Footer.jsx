import React from "react";
import { Link } from "react-router-dom";
import { SmartPgLogo } from "./Icons";

function Footer() {
  const role = localStorage.getItem("role") || "";

  const getDashboardPath = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "OWNER") return "/owner";
    if (role === "WARDEN") return "/warden";
    return "/dashboard";
  };

  return (
    <footer className="grand-footer">
      <div className="footer-container">
        <div className="footer-left">
          <SmartPgLogo size={20} />
          <div>
            <strong>Smart PG Management System</strong> — Professional hostel & PG property management platform.
          </div>
        </div>

        <div className="footer-status-pill">
          <span>●</span> All Systems Operational
        </div>

        <div className="footer-links">
          <Link to={getDashboardPath()}>Dashboard</Link>
          <Link to="/login">Sign In</Link>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>© {new Date().getFullYear()} Smart PG. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
