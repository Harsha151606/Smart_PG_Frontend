import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { SmartPgLogo } from "../components/Icons";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all registration fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!["STUDENT", "OWNER", "WARDEN"].includes(role)) {
      setError("Registration is restricted to Student, Property Owner, or Hostel Warden.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please verify your details or use another email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* Left Brand Banner */}
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
          <h2>Seamless Campus & Hostel Operations</h2>
          <p>
            Join Smart PG to manage residential quarters, room vacancies, tenant allocations, fee records, and maintenance requests in one consolidated platform.
          </p>

          <div className="auth-feature-pills">
            <div className="auth-pill">
              <span>👤</span> Tailored dashboards for Students, Owners, Wardens & Admins
            </div>
            <div className="auth-pill">
              <span>🚪</span> Instant room occupancy and vacancy tracking
            </div>
            <div className="auth-pill">
              <span>📑</span> Transparent grievance resolution and leave tracking
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          Smart PG Management System — Secure, Accessible, and Reliable Living Operations.
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <h2>Create Your Account</h2>
          <p className="auth-sub">Enter your details to register on Smart PG.</p>

          {error && (
            <div className="feedback-banner feedback-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="feedback-banner feedback-success">
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-field-group">
              <label className="form-label-grand">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input-grand"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label-grand">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input-grand"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-field-group">
                <label className="form-label-grand">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input-grand"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label-grand">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input-grand"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label-grand">Account Role</label>
              <select
                name="role"
                className="form-select-grand"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student (Resident)</option>
                <option value="OWNER">Property Owner</option>
                <option value="WARDEN">Hostel Warden</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-grand btn-primary-grand"
              style={{ width: "100%", marginTop: "10px", padding: "13px" }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ fontWeight: "700", color: "var(--navy-900)" }}>
              Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
