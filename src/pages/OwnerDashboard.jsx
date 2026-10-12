import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import {
  BuildingIcon,
  BedIcon,
  UsersIcon,
  PaymentIcon,
  ComplaintIcon,
  DashboardIcon
} from "../components/Icons";

function OwnerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    if (location.pathname === "/manage-rooms") return "rooms";
    if (location.pathname === "/manage-students") return "students";
    if (location.pathname === "/payments-overview") return "payments";
    if (location.pathname === "/complaints-overview") return "complaints";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [stats, setStats] = useState(null);
  const [pgs, setPgs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forms
  const [showPgForm, setShowPgForm] = useState(false);
  const [pgForm, setPgForm] = useState({ name: "", address: "" });

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomNumber: "", capacity: 2, rent: 5000, pgId: "" });

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "", pgId: "" });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ studentId: "", amount: "" });

  const [selectedAllocation, setSelectedAllocation] = useState({ studentId: "", roomId: "" });

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    loading: false,
    onConfirm: null,
  });

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === "/manage-rooms") setActiveTab("rooms");
    else if (location.pathname === "/manage-students") setActiveTab("students");
    else if (location.pathname === "/payments-overview") setActiveTab("payments");
    else if (location.pathname === "/complaints-overview") setActiveTab("complaints");
    else if (location.pathname === "/owner") setActiveTab("overview");
  }, [location.pathname]);

  useEffect(() => {
    fetchOwnerData(false);
    const interval = setInterval(() => {
      fetchOwnerData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOwnerData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, pgsRes, roomsRes, studentsRes, paymentsRes, complaintsRes] = await Promise.all([
        api.get("/owner/stats").catch(() => ({ data: null })),
        api.get("/owner/pgs").catch(() => ({ data: [] })),
        api.get("/owner/rooms").catch(() => ({ data: [] })),
        api.get("/owner/students").catch(() => ({ data: [] })),
        api.get("/payments").catch(() => ({ data: [] })),
        api.get("/complaints").catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setPgs(pgsRes.data || []);
      setRooms(roomsRes.data || []);
      setStudents(studentsRes.data || []);
      setPayments(paymentsRes.data || []);
      setComplaints(complaintsRes.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) {
        setError("Failed to load property owner operations data.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTabChange = (tab, route) => {
    setActiveTab(tab);
    navigate(route);
  };

  const handleCreatePG = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/owner/pgs", pgForm);
      setSuccess("New PG property added successfully!");
      setPgForm({ name: "", address: "" });
      setShowPgForm(false);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create PG property.");
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const selectedPgId = roomForm.pgId || pgs[0]?.id;
    if (!selectedPgId) {
      setError("Please create or select a PG property before adding a room.");
      return;
    }
    try {
      await api.post("/owner/rooms", { ...roomForm, pgId: selectedPgId });
      setSuccess(`Room ${roomForm.roomNumber} created successfully!`);
      setRoomForm({ roomNumber: "", capacity: 2, rent: 5000, pgId: selectedPgId });
      setShowRoomForm(false);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create room.");
    }
  };

  const handleDeleteRoom = (id, roomNum) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Room",
      message: `Are you sure you want to delete Room ${roomNum || id}? Ensure the room is unoccupied before proceeding.`,
      confirmText: "Delete Room",
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        setError("");
        setSuccess("");
        try {
          await api.delete(`/owner/rooms/${id}`);
          setSuccess("Room deleted successfully!");
          setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Confirm", loading: false, onConfirm: null });
          fetchOwnerData();
        } catch (err) {
          setError(err.response?.data?.error || "Failed to delete room. Ensure it is unoccupied.");
          setConfirmModal((prev) => ({ ...prev, loading: false, isOpen: false }));
        }
      },
    });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const targetPgId = studentForm.pgId || pgs[0]?.id;
    if (!targetPgId) {
      setError("Please select a valid PG property for this student.");
      return;
    }
    try {
      await api.post(`/owner/pgs/${targetPgId}/students`, studentForm);
      setSuccess("Student registered successfully!");
      setStudentForm({ name: "", email: "", password: "", pgId: targetPgId });
      setShowStudentForm(false);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register student.");
    }
  };

  const handleAssignRoom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { studentId, roomId } = selectedAllocation;
    if (!studentId || !roomId) {
      setError("Please select both a student and an available room.");
      return;
    }
    try {
      await api.post(`/room-assignment/assign?studentId=${studentId}&roomId=${roomId}`);
      setSuccess("Student assigned to room successfully!");
      setSelectedAllocation({ studentId: "", roomId: "" });
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Room assignment failed. Check bed capacity.");
    }
  };

  const handleRemoveFromRoom = (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Vacate Resident",
      message: `Are you sure you want to vacate resident ${studentName || studentId} from their current room? Bed availability will be restored.`,
      confirmText: "Vacate Resident",
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        setError("");
        setSuccess("");
        try {
          await api.delete(`/room-assignment/remove/${studentId}`);
          setSuccess("Student vacated from room. Bed availability updated!");
          setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Confirm", loading: false, onConfirm: null });
          fetchOwnerData();
        } catch (err) {
          setError(err.response?.data?.error || "Failed to remove student from room.");
          setConfirmModal((prev) => ({ ...prev, loading: false, isOpen: false }));
        }
      },
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!paymentForm.studentId || !paymentForm.amount) {
      setError("Please select a student and enter the payment amount.");
      return;
    }
    try {
      await api.post(`/payments?studentId=${paymentForm.studentId}&amount=${paymentForm.amount}`);
      setSuccess("Payment entry recorded successfully!");
      setPaymentForm({ studentId: "", amount: "" });
      setShowPaymentForm(false);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record payment transaction.");
    }
  };

  const handleResolveComplaint = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/complaints/${id}/status?status=${status}`);
      setSuccess(`Complaint status updated to ${status}!`);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update complaint status.");
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Owner Dashboard <span>🏢</span>
          </h2>
          <div className="header-subtitle">
            Manage your properties, room capacities, student allocations, fee collections, and maintenance complaints.
          </div>
        </div>

        <div className="header-actions">
          <button onClick={fetchOwnerData} className="btn-grand btn-secondary-grand btn-sm-grand">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div className="panel-card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading property operations data...
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

      {/* Navigation Tabs */}
      <div className="voyage-tabs">
        <button
          className={`voyage-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabChange("overview", "/owner")}
        >
          <DashboardIcon size={16} />
          Overview
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => handleTabChange("rooms", "/manage-rooms")}
        >
          <BedIcon size={16} />
          Rooms & Beds
          <span className="tab-badge">{rooms.length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => handleTabChange("students", "/manage-students")}
        >
          <UsersIcon size={16} />
          Students & Allocation
          <span className="tab-badge">{students.length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => handleTabChange("payments", "/payments-overview")}
        >
          <PaymentIcon size={16} />
          Rent & Payments
          <span className="tab-badge">{payments.length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => handleTabChange("complaints", "/complaints-overview")}
        >
          <ComplaintIcon size={16} />
          Complaints
          <span className="tab-badge">{complaints.length}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <div className="stat-grid">
            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">PG Properties</div>
                <div className="stat-value">{stats?.totalPGs ?? pgs.length}</div>
                <div className="stat-subtext">Active establishments</div>
              </div>
              <div className="stat-icon-crest gold">
                <BuildingIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Rooms</div>
                <div className="stat-value">{stats?.totalRooms ?? rooms.length}</div>
                <div className="stat-subtext">Configured units</div>
              </div>
              <div className="stat-icon-crest navy">
                <BedIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Bed Capacity</div>
                <div className="stat-value">{stats?.totalCapacity ?? 0}</div>
                <div className="stat-subtext">Max residents</div>
              </div>
              <div className="stat-icon-crest emerald">
                <span>🛏️</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Occupied Beds</div>
                <div className="stat-value" style={{ color: "var(--navy-900)" }}>
                  {stats?.totalOccupied ?? 0}
                </div>
                <div className="stat-subtext">Assigned students</div>
              </div>
              <div className="stat-icon-crest navy">
                <UsersIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Available Beds</div>
                <div className="stat-value" style={{ color: "var(--emerald-600)" }}>
                  {stats?.availableCapacity ?? 0}
                </div>
                <div className="stat-subtext">Vacant beds ready</div>
              </div>
              <div className="stat-icon-crest emerald">
                <span>✓</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Registered Students</div>
                <div className="stat-value">{stats?.totalStudents ?? students.length}</div>
                <div className="stat-subtext">Enrolled residents</div>
              </div>
              <div className="stat-icon-crest gold">
                <UsersIcon size={24} />
              </div>
            </div>
          </div>

          {/* PG Property Management Section */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>
                <BuildingIcon size={18} />
                My PG Establishments
              </h3>
              <button
                className="btn-grand btn-gold-grand btn-sm-grand"
                onClick={() => setShowPgForm(!showPgForm)}
              >
                {showPgForm ? "✕ Close Form" : "+ Add PG Property"}
              </button>
            </div>

            <div className="panel-card-body">
              {showPgForm && (
                <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "var(--navy-900)" }}>
                    Register New PG Property
                  </h4>
                  <form onSubmit={handleCreatePG}>
                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label className="form-label-grand">Property Name</label>
                        <input
                          type="text"
                          className="form-input-grand"
                          placeholder="e.g. Sunrise PG Hostel"
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
                          placeholder="e.g. 45 College Road"
                          value={pgForm.address}
                          onChange={(e) => setPgForm({ ...pgForm, address: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                        Save Property
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
                      <th>Property ID</th>
                      <th>PG Name</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pgs.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No PG properties created yet. Click "+ Add PG Property" above.
                        </td>
                      </tr>
                    ) : (
                      pgs.map((pg) => (
                        <tr key={pg.id}>
                          <td><strong>#{pg.id}</strong></td>
                          <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>🏢 {pg.name}</td>
                          <td style={{ color: "var(--text-muted)" }}>{pg.address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ROOM MANAGEMENT */}
      {activeTab === "rooms" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <BedIcon size={18} />
              Room & Bed Inventory
            </h3>
            <button
              className="btn-grand btn-gold-grand btn-sm-grand"
              onClick={() => setShowRoomForm(!showRoomForm)}
            >
              {showRoomForm ? "✕ Close Form" : "+ Create Room"}
            </button>
          </div>

          <div className="panel-card-body">
            {showRoomForm && (
              <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "var(--navy-900)" }}>
                  Add New Room
                </h4>
                <form onSubmit={handleCreateRoom}>
                  <div className="form-grid-3">
                    <div className="form-field-group">
                      <label className="form-label-grand">Room Number</label>
                      <input
                        type="text"
                        className="form-input-grand"
                        placeholder="e.g. 101 or A-1"
                        value={roomForm.roomNumber}
                        onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label-grand">Bed Capacity</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-input-grand"
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="form-label-grand">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input-grand"
                        value={roomForm.rent}
                        onChange={(e) => setRoomForm({ ...roomForm, rent: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label-grand">PG Property</label>
                    <select
                      className="form-select-grand"
                      value={roomForm.pgId || pgs[0]?.id || ""}
                      onChange={(e) => setRoomForm({ ...roomForm, pgId: e.target.value })}
                    >
                      {pgs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (#{p.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                      Create Room
                    </button>
                    <button type="button" onClick={() => setShowRoomForm(false)} className="btn-grand btn-secondary-grand btn-sm-grand">
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
                    <th>Room #</th>
                    <th>Property</th>
                    <th>Capacity</th>
                    <th>Occupied</th>
                    <th>Available</th>
                    <th>Monthly Rent</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No rooms configured yet. Click "+ Create Room" above.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((r) => {
                      const occ = r.occupied || 0;
                      const cap = r.capacity || 1;
                      const avail = Math.max(0, cap - occ);
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>Room {r.roomNumber}</td>
                          <td style={{ color: "var(--text-muted)" }}>{r.pg?.name || "General"}</td>
                          <td><strong>{cap} Beds</strong></td>
                          <td>
                            <span className={`badge-grand ${occ >= cap ? "badge-danger" : "badge-in_progress"}`}>
                              {occ} Occupied
                            </span>
                          </td>
                          <td>
                            <span className={`badge-grand ${avail > 0 ? "badge-present" : "badge-absent"}`}>
                              {avail} Vacant
                            </span>
                          </td>
                          <td style={{ fontWeight: "700", color: "var(--gold-600)" }}>
                            ₹{r.rent ? r.rent.toLocaleString() : "N/A"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteRoom(r.id, r.roomNumber)}
                              className="btn-grand btn-danger-grand btn-sm-grand"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENTS & ALLOCATION */}
      {activeTab === "students" && (
        <>
          {/* Room Allocation Panel */}
          <div className="panel-card" style={{ borderLeft: "4px solid var(--ocean-600)" }}>
            <div className="panel-card-header">
              <h3>
                <BedIcon size={18} />
                Room & Bed Assignment
              </h3>
            </div>
            <div className="panel-card-body">
              <form onSubmit={handleAssignRoom}>
                <div className="form-grid-2">
                  <div className="form-field-group">
                    <label className="form-label-grand">Select Student</label>
                    <select
                      className="form-select-grand"
                      value={selectedAllocation.studentId}
                      onChange={(e) => setSelectedAllocation({ ...selectedAllocation, studentId: e.target.value })}
                      required
                    >
                      <option value="">Choose student to allocate...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.name} ({s.user?.email}) {s.room ? `— Currently in Room ${s.room.roomNumber}` : "— Unassigned"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label-grand">Target Room</label>
                    <select
                      className="form-select-grand"
                      value={selectedAllocation.roomId}
                      onChange={(e) => setSelectedAllocation({ ...selectedAllocation, roomId: e.target.value })}
                      required
                    >
                      <option value="">Select available room...</option>
                      {rooms.map((r) => {
                        const avail = (r.capacity || 0) - (r.occupied || 0);
                        return (
                          <option key={r.id} value={r.id}>
                            Room {r.roomNumber} ({avail > 0 ? `${avail} beds available` : "Full"}) — {r.pg?.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                  Assign Student to Room
                </button>
              </form>
            </div>
          </div>

          {/* Student Directory Table */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>
                <UsersIcon size={18} />
                Enrolled Students
              </h3>
              <button
                className="btn-grand btn-gold-grand btn-sm-grand"
                onClick={() => setShowStudentForm(!showStudentForm)}
              >
                {showStudentForm ? "✕ Close Form" : "+ Register Student"}
              </button>
            </div>

            <div className="panel-card-body">
              {showStudentForm && (
                <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "var(--navy-900)" }}>
                    Register Student to PG
                  </h4>
                  <form onSubmit={handleCreateStudent}>
                    <div className="form-grid-3">
                      <div className="form-field-group">
                        <label className="form-label-grand">Full Name</label>
                        <input
                          type="text"
                          className="form-input-grand"
                          placeholder="e.g. Ananya Patel"
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-label-grand">Email Address</label>
                        <input
                          type="email"
                          className="form-input-grand"
                          placeholder="e.g. ananya@example.com"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-label-grand">Initial Password</label>
                        <input
                          type="password"
                          className="form-input-grand"
                          placeholder="Min 6 characters"
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label-grand">PG Property</label>
                      <select
                        className="form-select-grand"
                        value={studentForm.pgId || pgs[0]?.id || ""}
                        onChange={(e) => setStudentForm({ ...studentForm, pgId: e.target.value })}
                      >
                        {pgs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                        Register Student
                      </button>
                      <button type="button" onClick={() => setShowStudentForm(false)} className="btn-grand btn-secondary-grand btn-sm-grand">
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
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Room Assignment</th>
                      <th>PG Property</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No students registered yet. Click "+ Register Student" above.
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.id}>
                          <td><strong>#{s.id}</strong></td>
                          <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{s.user?.name}</td>
                          <td style={{ color: "var(--text-muted)" }}>{s.user?.email}</td>
                          <td>
                            {s.room ? (
                              <span className="badge-grand badge-present">
                                Room {s.room.roomNumber}
                              </span>
                            ) : (
                              <span className="badge-grand badge-warning">Unassigned</span>
                            )}
                          </td>
                          <td style={{ color: "var(--text-muted)" }}>{s.pg?.name || "General"}</td>
                          <td style={{ textAlign: "right" }}>
                            {s.room && (
                              <button
                                onClick={() => handleRemoveFromRoom(s.id, s.user?.name)}
                                className="btn-grand btn-danger-grand btn-sm-grand"
                              >
                                Vacate Room
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 4: PAYMENTS & RENT */}
      {activeTab === "payments" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <PaymentIcon size={18} />
              Rent Collections & Payment Records
            </h3>
            <button
              className="btn-grand btn-gold-grand btn-sm-grand"
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              {showPaymentForm ? "✕ Close Form" : "+ Record Payment"}
            </button>
          </div>

          <div className="panel-card-body">
            {showPaymentForm && (
              <div style={{ background: "var(--bg-parchment)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-gold)", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "var(--navy-900)" }}>
                  Record Rent Payment
                </h4>
                <form onSubmit={handleRecordPayment}>
                  <div className="form-grid-2">
                    <div className="form-field-group">
                      <label className="form-label-grand">Select Student</label>
                      <select
                        className="form-select-grand"
                        value={paymentForm.studentId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                        required
                      >
                        <option value="">Select student...</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.user?.name} (Room {s.room?.roomNumber || "None"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="form-label-grand">Amount (₹)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input-grand"
                        placeholder="e.g. 6000"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" className="btn-grand btn-primary-grand btn-sm-grand">
                      Record Payment
                    </button>
                    <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-grand btn-secondary-grand btn-sm-grand">
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
                    <th>Receipt #</th>
                    <th>Student Name</th>
                    <th>Room</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td><strong>#{p.id}</strong></td>
                        <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{p.student?.user?.name || "Student"}</td>
                        <td>{p.student?.room ? `Room ${p.student.room.roomNumber}` : "N/A"}</td>
                        <td style={{ fontWeight: "800", color: "var(--gold-600)", fontSize: "15px" }}>
                          ₹{p.amount ? p.amount.toLocaleString() : 0}
                        </td>
                        <td>
                          <span className={`badge-grand ${p.status === "PAID" ? "badge-paid" : "badge-pending"}`}>
                            {p.status || "PAID"}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {p.paymentDate ? p.paymentDate.split("T")[0] : "Recent"}
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

      {/* TAB 5: COMPLAINTS */}
      {activeTab === "complaints" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <ComplaintIcon size={18} />
              Maintenance & Resident Complaints
            </h3>
          </div>

          <div className="panel-card-body">
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Student</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No open complaints across your properties. All facilities operating smoothly.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id}>
                        <td><strong>#{c.id}</strong></td>
                        <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{c.student?.user?.name || "Student"}</td>
                        <td style={{ fontWeight: "600" }}>{c.title}</td>
                        <td style={{ color: "var(--text-muted)", maxWidth: "300px" }}>{c.description}</td>
                        <td>
                          <span
                            className={`badge-grand ${
                              c.status === "RESOLVED"
                                ? "badge-resolved"
                                : c.status === "IN_PROGRESS"
                                ? "badge-in_progress"
                                : "badge-open"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {c.status !== "RESOLVED" && (
                            <>
                              <button
                                onClick={() => handleResolveComplaint(c.id, "IN_PROGRESS")}
                                className="btn-grand btn-secondary-grand btn-sm-grand"
                                style={{ marginRight: "6px" }}
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleResolveComplaint(c.id, "RESOLVED")}
                                className="btn-grand btn-primary-grand btn-sm-grand"
                              >
                                ✓ Resolve
                              </button>
                            </>
                          )}
                          {c.status === "RESOLVED" && (
                            <span style={{ color: "var(--emerald-600)", fontWeight: "600", fontSize: "13px" }}>
                              Resolved
                            </span>
                          )}
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

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: "", message: "", confirmText: "Confirm", loading: false, onConfirm: null })}
      />
    </Layout>
  );
}

export default OwnerDashboard;
