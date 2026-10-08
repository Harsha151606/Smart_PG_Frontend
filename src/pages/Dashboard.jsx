import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // If nobody is logged in
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>
          <h2>Smart PG</h2>
          <p>Management System</p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="dashboard-content">

        <h1>
          Welcome, {user.name} 👋
        </h1>

        <p>
          You are logged in as{" "}
          <strong>{user.role}</strong>
        </p>

        <div className="cards">

          <div className="card">
            <h3>Name</h3>
            <p>{user.name}</p>
          </div>

          <div className="card">
            <h3>Email</h3>
            <p>{user.email}</p>
          </div>

          <div className="card">
            <h3>Role</h3>
            <p>{user.role}</p>
          </div>

          <div className="card">
            <h3>Status</h3>
            <p className="active">
              Active
            </p>
          </div>

        </div>

        <div className="dashboard-section">

          <h2>
            {user.role} Dashboard
          </h2>

          {user.role === "STUDENT" && (
            <div className="dashboard-grid">
            
        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/my-room")}
        >
          <h3>🛏️ My Room</h3>
          <p>
            View your room details
          </p>
        </div>
        
        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/my-rent")}
        >
          <h3>💰 My Rent</h3>
          <p>
            View rent and payment status
          </p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/attendance")}
        >
          <h3>📋 Attendance</h3>
          <p>
            View your attendance
          </p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/complaints")}
        >
          <h3>🛠️ Complaints</h3>
          <p>
            Submit and track complaints
          </p>
        </div>

        <div
          className="dashboard-card clickable"
          onClick={() => navigate("/leave-request")}
        >
          <h3>📝 Leave Request</h3>
          <p>Apply for leave</p>
        </div>
        
            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;