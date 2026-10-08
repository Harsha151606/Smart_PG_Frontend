import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create/Edit user form state
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [editingUserId, setEditingUserId] = useState(null);

  // Create PG form state
  const [pgForm, setPgForm] = useState({ name: "", address: "", ownerId: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pgsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/pgs")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPgs(pgsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch admin data. Please ensure you are logged in as ADMIN.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, userForm);
        setSuccess("User updated successfully!");
        setEditingUserId(null);
      } else {
        await api.post("/admin/users", userForm);
        setSuccess("User created successfully!");
      }
      setUserForm({ name: "", email: "", password: "", role: "STUDENT" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/users/${id}`);
      setSuccess("User deleted successfully!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user.");
    }
  };

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, email: user.email, password: "", role: user.role });
    setActiveTab("users");
  };

  const handleCreatePG = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post(`/admin/pgs?name=${encodeURIComponent(pgForm.name)}&address=${encodeURIComponent(pgForm.address)}&ownerId=${pgForm.ownerId}`);
      setSuccess("PG created successfully!");
      setPgForm({ name: "", address: "", ownerId: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create PG.");
    }
  };

  const handleDeletePG = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PG?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/pgs/${id}`);
      setSuccess("PG deleted successfully!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete PG.");
    }
  };

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Admin Control Panel</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Admin Control Panel 🔧</h1>
        <p className="page-description">Complete system oversight: users, PGs, operations, and analytics.</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>
            📊 Statistics
          </button>
          <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            👥 User Management
          </button>
          <button className={`tab-btn ${activeTab === "pgs" ? "active" : ""}`} onClick={() => setActiveTab("pgs")}>
            🏢 PG Management
          </button>
        </div>

        {loading ? (
          <p>Loading admin records...</p>
        ) : (
          <>
            {activeTab === "stats" && stats && (
              <>
                <div className="cards">
                  <div className="card">
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                  </div>
                  <div className="card">
                    <h3>Owners</h3>
                    <p>{stats.totalOwners}</p>
                  </div>
                  <div className="card">
                    <h3>Wardens</h3>
                    <p>{stats.totalWardens}</p>
                  </div>
                  <div className="card">
                    <h3>Students</h3>
                    <p>{stats.totalStudents}</p>
                  </div>
                  <div className="card">
                    <h3>Total PGs</h3>
                    <p>{stats.totalPGs}</p>
                  </div>
                  <div className="card">
                    <h3>Total Rooms</h3>
                    <p>{stats.totalRooms}</p>
                  </div>
                  <div className="card">
                    <h3>Occupancy</h3>
                    <p>{stats.totalOccupied} / {stats.totalCapacity}</p>
                  </div>
                  <div className="card">
                    <h3>Total Revenue</h3>
                    <p>₹{stats.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div className="cards">
                  <div className="card">
                    <h3>Open Complaints</h3>
                    <p style={{ color: stats.openComplaints > 0 ? "#ef4444" : "#16a34a" }}>
                      {stats.openComplaints}
                    </p>
                  </div>
                  <div className="card">
                    <h3>Pending Leaves</h3>
                    <p style={{ color: stats.pendingLeaves > 0 ? "#f59e0b" : "#16a34a" }}>
                      {stats.pendingLeaves}
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <div className="page-box">
                <div className="box-title">
                  <span>{editingUserId ? "Edit User" : "Add New User"}</span>
                  {editingUserId && (
                    <button className="btn-sm btn-secondary" onClick={() => { setEditingUserId(null); setUserForm({ name: "", email: "", password: "", role: "STUDENT" }); }}>
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleCreateOrUpdateUser}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="user@example.com"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{editingUserId ? "Password (leave blank to keep)" : "Password"}</label>
                      <input
                        type="password"
                        placeholder="Secret password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required={!editingUserId}
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="OWNER">OWNER</option>
                        <option value="WARDEN">WARDEN</option>
                        <option value="STUDENT">STUDENT</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    {editingUserId ? "Update User" : "Create User"}
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>All Users Directory</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${
                            u.role === "ADMIN" ? "badge-danger" :
                            u.role === "OWNER" ? "badge-info" :
                            u.role === "WARDEN" ? "badge-warning" : "badge-success"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button className="btn-sm btn-secondary" onClick={() => handleStartEdit(u)}>Edit</button>
                          <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "pgs" && (
              <div className="page-box">
                <div className="box-title">Create New PG</div>
                <form onSubmit={handleCreatePG}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>PG Name</label>
                      <input
                        type="text"
                        placeholder="Sunrise Hostel"
                        value={pgForm.name}
                        onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        placeholder="123 Tech Park Road"
                        value={pgForm.address}
                        onChange={(e) => setPgForm({ ...pgForm, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Assigned Owner</label>
                      <select
                        value={pgForm.ownerId}
                        onChange={(e) => setPgForm({ ...pgForm, ownerId: e.target.value })}
                        required
                      >
                        <option value="">Select Owner</option>
                        {users.filter(u => u.role === "OWNER" || u.role === "ADMIN").map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    Create PG
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>Registered PGs</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>PG Name</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pgs.map((pg) => (
                      <tr key={pg.id}>
                        <td>{pg.id}</td>
                        <td><strong>{pg.name}</strong></td>
                        <td>{pg.address}</td>
                        <td>
                          <button className="btn-sm btn-danger" onClick={() => handleDeletePG(pg.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
