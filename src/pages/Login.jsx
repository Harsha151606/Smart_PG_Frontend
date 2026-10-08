import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      
      const loggedInUser = {
        id: response.data.userId,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        token: response.data.token
      };

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    }
  };

  return (
    <div className="login-container">

      <div className="login-box">

        <h1>Welcome Back</h1>

        <p className="login-title">
          Smart PG Management System
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>

        </form>

        <div className="register-link">
          <p>
            Don't have an account?{" "}
            <Link to="/register">
              Create Account
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;