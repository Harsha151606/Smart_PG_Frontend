import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (user) =>
        user.email === email &&
        user.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    const loggedInUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    navigate("/dashboard");
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