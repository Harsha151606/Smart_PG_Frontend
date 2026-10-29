import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import {
  DashboardIcon,
  UsersIcon,
  BuildingIcon,
  PaymentIcon,
  LeaveIcon,
  ComplaintIcon,
  BedIcon
} from "../components/Icons";

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial tab from route
  const getInitialTab = () => {
    if (location.pathname === "/manage-users") return "users";
    if (location.pathname === "/manage-pgs") return "pgs";
    return "stats";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Role filter for user management (ALL, OWNER, WARDEN, STUDENT, ADMIN)
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");

  // Create/Edit user form state
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Create PG form state
  const [pgForm, setPgForm] = useState({ name: "", address: "", ownerId: "" });
  const [showPgForm, setShowPgForm] = useState(false);

  // Modern Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    loading: false,
    onConfirm: null,
  });

  // Sync tab with URL if URL changes
  useEffect(() => {
    if (location.pathname === "/manage-users") setActiveTab("users");
    else if (location.pathname === "/manage-pgs") setActiveTab("pgs");
    else if (location.pathname === "/system-stats" || location.pathname === "/admin") setActiveTab("stats");
  }, [location.pathname]);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, usersRes, pgsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/pgs")
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setPgs(pgsRes.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) {
        setError("Failed to fetch admin data. Please ensure you are logged in as an Administrator.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTabChange = (tab, route) => {
    setActiveTab(tab);
    navigate(route);
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
        setSuccess("New user created successfully!");
      }
      setUserForm({ name: "", email: "", password: "", role: "STUDENT" });
      setShowUserForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "User operation failed. Please check inputs.");
    }
  };

  const handleDeleteUser = (id, userName) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete user account '${userName || id}'? All associated records will be removed.`,
      confirmText: "Delete User",
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        setError("");
        setSuccess("");
        try {
          await api.delete(`/admin/users/${id}`);
          setSuccess("User deleted successfully!");
          setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Delete", loading: false, onConfirm: null });
          fetchData();
        } catch (err) {
          setError(err.response?.data?.error || "Failed to delete user.");
          setConfirmModal((prev) => ({ ...prev, loading: false, isOpen: false }));
        }
      },
    });
  };

  const handleStartEdit = (user) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowUserForm(true);
    setActiveTab("users");
  };

  const handleCancelUserForm = () => {
    setEditingUserId(null);
    setUserForm({ name: "", email: "", password: "", role: "STUDENT" });
    setShowUserForm(false);
  };

  const handleCreatePG = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!pgForm.ownerId) {
      setError("Please select an owner for this PG property.");
      return;
    }
    try {
      await api.post(
        `/admin/pgs?name=${encodeURIComponent(pgForm.name)}&address=${encodeURIComponent(pgForm.address)}&ownerId=${pgForm.ownerId}`
      );
      setSuccess("PG property created successfully!");
      setPgForm({ name: "", address: "", ownerId: "" });
      setShowPgForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create PG property.");
    }
  };

  const handleDeletePG = (id, pgName) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete PG Property",
      message: `Are you sure you want to delete PG property '${pgName || `PG #${id}`}'? All associated rooms and tenant allocations will be removed. This action cannot be undone.`,
      confirmText: "Delete Property",
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        setError("");
        setSuccess("");
        try {
          await api.delete(`/admin/pgs/${id}`);
          setSuccess(`PG property '${pgName || id}' deleted successfully!`);
          setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Delete", loading: false, onConfirm: null });
          fetchData();
        } catch (err) {
          setError(err.response?.data?.error || "Failed to delete PG. Ensure rooms are empty.");
          setConfirmModal((prev) => ({ ...prev, loading: false, isOpen: false }));
        }
      },
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const ownersList = users.filter((u) => u.role === "OWNER");

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Admin Dashboard <span>👑</span>
          </h2>
          <div className="header-subtitle">
            System overview and management of users, PG properties, and operational analytics.
          </div>
        </div>

        <div className="header-actions">
          <button onClick={fetchData} className="btn-grand btn-secondary-grand btn-sm-grand" title="Reload live data">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div className="panel-card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading system administrative records...
        </div>
      )}
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

      {/* Tabs */}
      <div className="voyage-tabs">
        <button
          className={`voyage-tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => handleTabChange("stats", "/admin")}
        >
          <DashboardIcon size={16} />
          System Analytics
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => handleTabChange("users", "/manage-users")}
        >
          <UsersIcon size={16} />
          Manage Users
          <span className="tab-badge">{users.length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "pgs" ? "active" : ""}`}
          onClick={() => handleTabChange("pgs", "/manage-pgs")}
        >
          <BuildingIcon size={16} />
          Manage PGs
          <span className="tab-badge">{pgs.length}</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM STATS */}
      {activeTab === "stats" && !loading && !stats && !error && (
        <div className="empty-deck-state">
          <div className="empty-deck-icon">📊</div>
          <h4>System metrics are unavailable</h4>
          <p>We could not retrieve the latest system summary. Refresh to try again; no placeholder totals are shown.</p>
          <button type="button" className="btn-grand btn-primary-grand btn-sm-grand" onClick={() => fetchData()}>Retry loading metrics</button>
        </div>
      )}
      {activeTab === "stats" && stats && (
        <>
          <div className="stat-grid">
            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.totalUsers || 0}</div>
                <div className="stat-subtext">Registered accounts</div>
              </div>
              <div className="stat-icon-crest navy">
                <UsersIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total PG Properties</div>
                <div className="stat-value">{stats.totalPGs || 0}</div>
                <div className="stat-subtext">Active establishments</div>
              </div>
              <div className="stat-icon-crest gold">
                <BuildingIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Rooms</div>
                <div className="stat-value">{stats.totalRooms || 0}</div>
                <div className="stat-subtext">Configured units</div>
              </div>
              <div className="stat-icon-crest emerald">
                <BedIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Enrolled Students</div>
                <div className="stat-value">{stats.totalStudents || 0}</div>
                <div className="stat-subtext">Residents housed</div>
              </div>
              <div className="stat-icon-crest navy">
                <span>🎓</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value" style={{ color: "var(--gold-600)" }}>
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </div>
                <div className="stat-subtext">{stats.totalPayments || 0} payment transactions</div>
              </div>
              <div className="stat-icon-crest gold">
                <PaymentIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Complaints</div>
                <div className="stat-value">{stats.totalComplaints || 0}</div>
                <div className="stat-subtext">Reported grievances</div>
              </div>
              <div className="stat-icon-crest navy">
                <ComplaintIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Leave Applications</div>
                <div className="stat-value">{stats.totalLeaves || 0}</div>
                <div className="stat-subtext">Logged student leaves</div>
              </div>
              <div className="stat-icon-crest emerald">
                <LeaveIcon size={24} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: MANAGE USERS */}
      {activeTab === "users" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <UsersIcon size={18} />
              User Directory & Role Management
            </h3>
            <button
              className="btn-grand btn-gold-grand btn-sm-grand"
              onClick={() => {
                setEditingUserId(null);
                setUserForm({ name: "", email: "", password: "", role: "STUDENT" });
                setShowUserForm(!showUserForm);
              }}
            >
              {showUserForm ? "✕ Close Form" : "+ Add New User"}
            </button>
          </div>

          <div className="panel-card-body">
            {/* Create/Edit Form */}
            {showUserForm && (
              <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "14px", color: "var(--navy-900)" }}>
                  {editingUserId ? `✏️ Edit User (#${editingUserId})` : "+ Create New System User"}
                </h4>
                <form onSubmit={handleCreateOrUpdateUser}>
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label-grand">Full Name</label>
                      <input
                        type="text"
                        className="form-input-grand"
                        placeholder="e.g. Ramesh Kumar"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label-grand">Email Address</label>
                      <input
                        type="email"
                        className="form-input-grand"
                        placeholder="e.g. ramesh@example.com"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label-grand">
                        Password {editingUserId && <small>(Leave blank to keep unchanged)</small>}
                      </label>
                      <input
                        type="password"
                        className="form-input-grand"
                        placeholder={editingUserId ? "Leave blank to keep unchanged" : "Min 6 characters"}
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required={!editingUserId}
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label-grand">User Role</label>
                      <select
                        className="form-select-grand"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="OWNER">Property Owner</option>
                        <option value="WARDEN">Hostel Warden</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                      {editingUserId ? "Save Changes" : "Create User"}
                    </button>
                    <button type="button" onClick={handleCancelUserForm} className="btn-grand btn-secondary-grand btn-sm-grand">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { key: "ALL", label: "All Users" },
                  { key: "OWNER", label: "Owners" },
                  { key: "WARDEN", label: "Wardens" },
                  { key: "STUDENT", label: "Students" },
                  { key: "ADMIN", label: "Admins" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRoleFilter(item.key)}
                    className={`btn-grand btn-sm-grand ${roleFilter === item.key ? "btn-primary-grand" : "btn-secondary-grand"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="🔍 Search users by name or email..."
                className="form-input-grand"
                style={{ width: "260px" }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No users found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td><strong>#{u.id}</strong></td>
                        <td style={{ fontWeight: "600", color: "var(--navy-900)" }}>{u.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                        <td>
                          <span
                            className={`badge-grand ${
                              u.role === "ADMIN"
                                ? "badge-danger"
                                : u.role === "OWNER"
                                ? "badge-warning"
                                : u.role === "WARDEN"
                                ? "badge-in_progress"
                                : "badge-present"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="btn-grand btn-secondary-grand btn-sm-grand"
                            style={{ marginRight: "6px" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="btn-grand btn-danger-grand btn-sm-grand"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE PGS */}
      {activeTab === "pgs" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <BuildingIcon size={18} />
              Registered PG Properties
            </h3>
            <button
              className="btn-grand btn-gold-grand btn-sm-grand"
              onClick={() => setShowPgForm(!showPgForm)}
            >
              {showPgForm ? "✕ Close Form" : "+ Register New PG"}
            </button>
          </div>

          <div className="panel-card-body">
            {showPgForm && (
              <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "24px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "14px", color: "var(--navy-900)" }}>
                  + Register New PG Property
                </h4>
                <form onSubmit={handleCreatePG}>
                  <div className="form-grid-3">
                    <div className="form-field-group">
                      <label className="form-label-grand">Property Name</label>
                      <input
                        type="text"
                        className="form-input-grand"
                        placeholder="e.g. Royal PG Hostel"
                        value={pgForm.name}
                        onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label-grand">Address / Location</label>
                      <input
                        type="text"
                        className="form-input-grand"
                        placeholder="e.g. 124 North Campus Road"
                        value={pgForm.address}
                        onChange={(e) => setPgForm({ ...pgForm, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-field-group">
                      <label className="form-label-grand">Designated Property Owner</label>
                      <select
                        className="form-select-grand"
                        value={pgForm.ownerId}
                        onChange={(e) => setPgForm({ ...pgForm, ownerId: e.target.value })}
                        required
                      >
                        <option value="">Select an Owner...</option>
                        {ownersList.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                      Create PG
                    </button>
                    <button type="button" onClick={() => setShowPgForm(false)} className="btn-grand btn-secondary-grand btn-sm-grand">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>PG ID</th>
                    <th>Property Name</th>
                    <th>Address</th>
                    <th>Assigned Owner</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pgs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No PG properties registered yet. Click "+ Register New PG" above.
                      </td>
                    </tr>
                  ) : (
                    pgs.map((pg) => (
                      <tr key={pg.id}>
                        <td><strong>#{pg.id}</strong></td>
                        <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>🏢 {pg.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>{pg.address}</td>
                        <td>
                          {pg.owner ? (
                            <span>
                              <strong>{pg.owner.name}</strong> <small style={{ color: "var(--text-muted)" }}>({pg.owner.email})</small>
                            </span>
                          ) : (
                            <span className="badge-grand badge-warning">Unassigned</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDeletePG(pg.id, pg.name)}
                            className="btn-grand btn-danger-grand btn-sm-grand"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Delete", loading: false, onConfirm: null })}
      />
    </Layout>
  );
}

export default AdminDashboard;
