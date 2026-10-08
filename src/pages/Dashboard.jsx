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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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

          <div className="dashboard-grid">
          {user.role === "STUDENT" && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate("/my-room")}>
                <h3>🛏️ My Room</h3>
                <p>View your room details</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/my-rent")}>
                <h3>💰 My Rent</h3>
                <p>View rent and payment status</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/attendance")}>
                <h3>📋 Attendance</h3>
                <p>View your attendance</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/complaints")}>
                <h3>🛠️ Complaints</h3>
                <p>Submit and track complaints</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/leave-request")}>
                <h3>📝 Leave Request</h3>
                <p>Apply for leave</p>
              </div>
            </>
          )}

          {user.role === "ADMIN" && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-users")}>
                <h3>👥 Manage Users</h3>
                <p>View and edit users</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-pgs")}>
                <h3>🏢 Manage PGs</h3>
                <p>View all PGs in system</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/system-stats")}>
                <h3>📊 System Stats</h3>
                <p>Overall application statistics</p>
              </div>
            </>
          )}

          {user.role === "OWNER" && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-rooms")}>
                <h3>🚪 Manage Rooms</h3>
                <p>Allocate and edit rooms</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-students")}>
                <h3>🎓 Manage Students</h3>
                <p>Add or remove students</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/payments-overview")}>
                <h3>💳 Payments</h3>
                <p>Track rent collections</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/complaints-overview")}>
                <h3>🛠️ View Complaints</h3>
                <p>Address student issues</p>
              </div>
            </>
          )}

          {user.role === "WARDEN" && (
            <>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-attendance")}>
                <h3>📋 Mark Attendance</h3>
                <p>Manage daily attendance</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/manage-leaves")}>
                <h3>📝 Leave Requests</h3>
                <p>Approve or reject leaves</p>
              </div>
              <div className="dashboard-card clickable" onClick={() => navigate("/view-students")}>
                <h3>👁️ View Students</h3>
                <p>View student directory</p>
              </div>
            </>
          )}
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;