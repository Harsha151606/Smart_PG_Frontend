import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const handleRegister = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      name,
      email,
      password,
      confirmPassword,
      role
    } = formData;

    // 1. Check empty fields
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    // 2. Check email
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    // 3. Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // 4. Check passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 5. Get existing users
    const existingUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    // 6. Check duplicate email
    const existingUser = existingUsers.find(
      (user) => user.email === email
    );

    if (existingUser) {
      setError("An account with this email already exists.");
      return;
    }

    // 7. Create new user
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
      role: role
    };

    // 8. Add user to existing users
    existingUsers.push(newUser);

    // 9. Save users
    localStorage.setItem(
      "users",
      JSON.stringify(existingUsers)
    );

    // 10. Show success
    setSuccess(
      "Account created successfully!"
    );

    // 11. Clear form
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT"
    });

    // 12. Go to login after 1 second
    setTimeout(() => {
      navigate("/login");
    }, 1000);
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
