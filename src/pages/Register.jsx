import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      setSuccess("Account created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT"
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="login-container">

      <div className="login-box">

        <h1>Create Account</h1>

        <p className="login-title">
          Smart PG Management System
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Email */}
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* Password */}
          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <label>Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {/* Role */}
          <label>Role</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="STUDENT">
              Student
            </option>

            <option value="OWNER">
              Owner
            </option>

            <option value="WARDEN">
              Warden
            </option>
          </select>

          {/* Error */}
          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="success">
              {success}
            </p>
          )}

          <button type="submit">
            Create Account
          </button>

        </form>

        <div className="register-link">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;
