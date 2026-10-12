import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { SmartPgLogo } from "../components/Icons";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });

      const loggedInUser = {
        id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token,
      };

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      // Navigate to role-specific dashboard
      if (response.data.role === "ADMIN") {
        navigate("/admin");
      } else if (response.data.role === "OWNER") {
        navigate("/owner");
      } else if (response.data.role === "WARDEN") {
        navigate("/warden");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="auth-split-page">
      {/* Left Professional Brand Banner */}
      <div className="auth-brand-side">
        <div className="auth-brand-top">
          <div className="brand-crest">
            <SmartPgLogo size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              Smart <span style={{ color: "#FBBF24" }}>PG</span>
            </h1>
            <div style={{ fontSize: "11px", color: "rgba(224,242,254,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Management System
            </div>
          </div>
        </div>

        <div className="auth-brand-mid">
          <h2>Enterprise Property & Hostel Management</h2>
          <p>
            Smart PG simplifies accommodations for students, owners, wardens, and administrators through integrated room allocation, automated rent ledgers, daily attendance tracking, and grievance management.
          </p>

          <div className="auth-feature-pills">
            <div className="auth-pill">
              <span>🛏️</span> Real-time Room Allocation & Bed Capacity
            </div>
            <div className="auth-pill">
              <span>💳</span> Automated Rent Tracking & Payment Receipts
            </div>
            <div className="auth-pill">
              <span>📋</span> Daily Attendance & Student Leave Approvals
            </div>
            <div className="auth-pill">
              <span>🛡️</span> Strict Role-Based Access Control & Privacy
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          Smart PG Management System — Secure, Accessible, and Reliable Living Operations.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <h2>Sign In to Smart PG</h2>
          <p className="auth-sub">Enter your account credentials to access your dashboard.</p>

          {/* Quick Demo Switcher */}
          <div className="demo-account-box">
            <p>⚡ Quick Role Switcher (Evaluation Demos)</p>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemo("student@smartpg.com")}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemo("owner@smartpg.com")}
              >
                🏢 Owner
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemo("warden@smartpg.com")}
              >
                📋 Warden
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemo("admin@smartpg.com")}
              >
                👑 Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="feedback-banner feedback-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-field-group">
              <label className="form-label-grand">Email Address</label>
              <input
                type="email"
                className="form-input-grand"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label-grand">Password</label>
              <input
                type="password"
                className="form-input-grand"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-grand btn-primary-grand"
              style={{ width: "100%", marginTop: "10px", padding: "13px" }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Need a new account?{" "}
            <Link to="/register" style={{ fontWeight: "700", color: "var(--navy-900)" }}>
              Create an Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;