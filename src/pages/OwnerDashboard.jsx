import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function OwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
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
  const [pgForm, setPgForm] = useState({ name: "", address: "" });
  const [roomForm, setRoomForm] = useState({ roomNumber: "", capacity: 2, rent: 5000, pgId: "" });
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "", pgId: "" });
  const [paymentForm, setPaymentForm] = useState({ studentId: "", amount: "" });
  const [selectedAllocation, setSelectedAllocation] = useState({ studentId: "", roomId: "" });

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
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
      setPgs(pgsRes.data);
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
      setPayments(paymentsRes.data);
      setComplaints(complaintsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load owner data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePG = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/owner/pgs", pgForm);
      setSuccess("PG created successfully!");
      setPgForm({ name: "", address: "" });
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create PG.");
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/owner/rooms", roomForm);
      setSuccess("Room created successfully!");
      setRoomForm({ roomNumber: "", capacity: 2, rent: 5000, pgId: pgs[0]?.id || "" });
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create room.");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/owner/rooms/${id}`);
      setSuccess("Room deleted successfully!");
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete room.");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post(`/owner/pgs/${studentForm.pgId}/students`, {
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password
      });
      setSuccess("Student registered successfully!");
      setStudentForm({ name: "", email: "", password: "", pgId: pgs[0]?.id || "" });
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register student.");
    }
  };

  const handleAssignRoom = async (studentId, roomId) => {
    if (!roomId) {
      setError("Please select a room to assign.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await api.post(`/room-assignment/assign?studentId=${studentId}&roomId=${roomId}`);
      setSuccess("Student successfully assigned to room!");
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign room.");
    }
  };

  const handleRemoveFromRoom = async (studentId) => {
    if (!window.confirm("Remove student from room?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/room-assignment/remove/${studentId}`);
      setSuccess("Student removed from room successfully!");
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove student from room.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/owner/students/${studentId}`);
      setSuccess("Student deleted successfully!");
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete student.");
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post(`/payments?studentId=${paymentForm.studentId}&amount=${paymentForm.amount}`);
      setSuccess("Payment recorded successfully!");
      setPaymentForm({ studentId: "", amount: "" });
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record payment.");
    }
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/complaints/${id}/status?status=${status}`);
      setSuccess(`Complaint updated to ${status}!`);
      fetchOwnerData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update complaint status.");
    }
  };

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Owner Dashboard</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Owner Control Panel 🏢</h1>
        <p className="page-description">Manage your properties, rooms, students, rent payments, and complaints.</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            📊 Overview
          </button>
          <button className={`tab-btn ${activeTab === "pgs" ? "active" : ""}`} onClick={() => setActiveTab("pgs")}>
            🏢 My PGs
          </button>
          <button className={`tab-btn ${activeTab === "rooms" ? "active" : ""}`} onClick={() => setActiveTab("rooms")}>
            🚪 Rooms
          </button>
          <button className={`tab-btn ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
            🎓 Students & Allocation
          </button>
          <button className={`tab-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
            💳 Payments
          </button>
          <button className={`tab-btn ${activeTab === "complaints" ? "active" : ""}`} onClick={() => setActiveTab("complaints")}>
            🛠️ Complaints
          </button>
        </div>

        {loading ? (
          <p>Loading owner data...</p>
        ) : (
          <>
            {activeTab === "overview" && stats && (
              <div className="cards">
                <div className="card">
                  <h3>My PGs</h3>
                  <p>{stats.totalPGs}</p>
                </div>
                <div className="card">
                  <h3>Total Rooms</h3>
                  <p>{stats.totalRooms}</p>
                </div>
                <div className="card">
                  <h3>Total Students</h3>
                  <p>{stats.totalStudents}</p>
                </div>
                <div className="card">
                  <h3>Occupancy</h3>
                  <p>{stats.totalOccupied} / {stats.totalCapacity}</p>
                </div>
                <div className="card">
                  <h3>Available Beds</h3>
                  <p style={{ color: "#16a34a" }}>{stats.availableCapacity}</p>
                </div>
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
                        placeholder="Greenwood PG"
                        value={pgForm.name}
                        onChange={(e) => setPgForm({ ...pgForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        placeholder="Street 12, City Center"
                        value={pgForm.address}
                        onChange={(e) => setPgForm({ ...pgForm, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    Add PG
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>My Properties</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pgs.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="page-box">
                <div className="box-title">Create New Room</div>
                <form onSubmit={handleCreateRoom}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Room Number</label>
                      <input
                        type="text"
                        placeholder="101"
                        value={roomForm.roomNumber}
                        onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Monthly Rent (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={roomForm.rent}
                        onChange={(e) => setRoomForm({ ...roomForm, rent: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Select PG</label>
                      <select
                        value={roomForm.pgId}
                        onChange={(e) => setRoomForm({ ...roomForm, pgId: e.target.value })}
                        required
                      >
                        <option value="">Select PG</option>
                        {pgs.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    Create Room
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>Rooms Directory</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Capacity</th>
                      <th>Occupied</th>
                      <th>Status</th>
                      <th>Rent</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.roomNumber}</strong></td>
                        <td>{r.capacity} beds</td>
                        <td>{r.occupied || 0}</td>
                        <td>
                          <span className={`badge ${(r.occupied || 0) >= r.capacity ? "badge-danger" : "badge-success"}`}>
                            {(r.occupied || 0) >= r.capacity ? "FULL" : "AVAILABLE"}
                          </span>
                        </td>
                        <td>₹{r.rent}</td>
                        <td>
                          <button className="btn-sm btn-danger" onClick={() => handleDeleteRoom(r.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "students" && (
              <div className="page-box">
                <div className="box-title">Register New Student</div>
                <form onSubmit={handleCreateStudent}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        placeholder="student@example.com"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Assign to PG</label>
                      <select
                        value={studentForm.pgId}
                        onChange={(e) => setStudentForm({ ...studentForm, pgId: e.target.value })}
                        required
                      >
                        <option value="">Select PG</option>
                        {pgs.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    Register Student
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>Students & Room Allocation</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>PG</th>
                      <th>Room</th>
                      <th>Room Allocation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td><strong>{s.user?.name}</strong></td>
                        <td>{s.user?.email}</td>
                        <td>{s.pg?.name || "N/A"}</td>
                        <td>
                          {s.room ? (
                            <span className="badge badge-success">Room {s.room.roomNumber}</span>
                          ) : (
                            <span className="badge badge-warning">Unassigned</span>
                          )}
                        </td>
                        <td>
                          {s.room ? (
                            <button className="btn-sm btn-danger" onClick={() => handleRemoveFromRoom(s.id)}>
                              Remove Room
                            </button>
                          ) : (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <select
                                style={{ padding: "4px", fontSize: "12px", borderRadius: "4px" }}
                                value={selectedAllocation[s.id] || ""}
                                onChange={(e) => setSelectedAllocation({ ...selectedAllocation, [s.id]: e.target.value })}
                              >
                                <option value="">Select Room</option>
                                {rooms
                                  .filter(r => (r.occupied || 0) < r.capacity)
                                  .map(r => (
                                    <option key={r.id} value={r.id}>
                                      Room {r.roomNumber} ({r.occupied || 0}/{r.capacity})
                                    </option>
                                  ))}
                              </select>
                              <button
                                className="btn-sm btn-primary"
                                onClick={() => handleAssignRoom(s.id, selectedAllocation[s.id])}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <button className="btn-sm btn-danger" onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="page-box">
                <div className="box-title">Record Rent Payment</div>
                <form onSubmit={handleRecordPayment}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Select Student</label>
                      <select
                        value={paymentForm.studentId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                        required
                      >
                        <option value="">Select Student</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.user?.name} ({s.user?.email}) - Room {s.room?.roomNumber || "None"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="7500"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-sm btn-primary" style={{ padding: "10px 20px" }}>
                    Record Payment
                  </button>
                </form>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>Payment History</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.student?.user?.name || "Student #" + p.student?.id}</td>
                        <td><strong>₹{p.amount}</strong></td>
                        <td>{p.date}</td>
                        <td>
                          <span className={`badge ${p.status === "PAID" ? "badge-success" : "badge-warning"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="page-box">
                <div className="box-title">Student Complaints Overview</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.student?.user?.name || "Student #" + c.student?.id}</td>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.description}</td>
                        <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recent"}</td>
                        <td>
                          <span className={`badge ${
                            c.status === "RESOLVED" ? "badge-success" :
                            c.status === "IN_PROGRESS" ? "badge-warning" : "badge-danger"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.status !== "IN_PROGRESS" && (
                            <button className="btn-sm btn-secondary" onClick={() => handleUpdateComplaintStatus(c.id, "IN_PROGRESS")}>
                              In Progress
                            </button>
                          )}
                          {c.status !== "RESOLVED" && (
                            <button className="btn-sm btn-success" onClick={() => handleUpdateComplaintStatus(c.id, "RESOLVED")}>
                              Resolve
                            </button>
                          )}
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

export default OwnerDashboard;
