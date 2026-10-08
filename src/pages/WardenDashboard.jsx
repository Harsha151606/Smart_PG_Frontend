import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function WardenDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("attendance");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchWardenData();
  }, []);

  useEffect(() => {
    fetchAttendanceForDate(attendanceDate);
  }, [attendanceDate]);

  const fetchWardenData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, roomsRes, leavesRes, complaintsRes] = await Promise.all([
        api.get("/warden/stats").catch(() => ({ data: null })),
        api.get("/warden/students").catch(() => ({ data: [] })),
        api.get("/warden/rooms").catch(() => ({ data: [] })),
        api.get("/leaves").catch(() => ({ data: [] })),
        api.get("/complaints").catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
      setLeaves(leavesRes.data);
      setComplaints(complaintsRes.data);
      setError("");
    } catch (err) {
      setError("Failed to load warden operations data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const res = await api.get(`/attendance/date/${date}`);
      setDailyAttendance(res.data);
    } catch (err) {
      setDailyAttendance([]);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    setError("");
    setSuccess("");
    try {
      await api.post("/attendance", {
        studentId,
        date: attendanceDate,
        status
      });
      setSuccess(`Marked ${status} for student.`);
      fetchAttendanceForDate(attendanceDate);
      // Refresh stats
      api.get("/warden/stats").then(res => setStats(res.data)).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark attendance.");
    }
  };

  const handleUpdateLeave = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/leaves/${id}/status?status=${status}`);
      setSuccess(`Leave request marked as ${status}!`);
      const leavesRes = await api.get("/leaves");
      setLeaves(leavesRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update leave.");
    }
  };

  const handleUpdateComplaint = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/complaints/${id}/status?status=${status}`);
      setSuccess(`Complaint marked as ${status}!`);
      const complaintsRes = await api.get("/complaints");
      setComplaints(complaintsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update complaint.");
    }
  };

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Warden Dashboard</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Warden Control Panel 🛡️</h1>
        <p className="page-description">Oversee daily student attendance, leave approvals, and hostel discipline.</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
            📋 Daily Attendance
          </button>
          <button className={`tab-btn ${activeTab === "leaves" ? "active" : ""}`} onClick={() => setActiveTab("leaves")}>
            📝 Leave Requests
          </button>
          <button className={`tab-btn ${activeTab === "complaints" ? "active" : ""}`} onClick={() => setActiveTab("complaints")}>
            🛠️ Complaints
          </button>
          <button className={`tab-btn ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
            👥 Student Directory
          </button>
        </div>

        {loading ? (
          <p>Loading warden data...</p>
        ) : (
          <>
            {stats && (
              <div className="cards" style={{ marginBottom: "20px" }}>
                <div className="card">
                  <h3>Total Students</h3>
                  <p>{stats.totalStudents}</p>
                </div>
                <div className="card">
                  <h3>Present Today</h3>
                  <p style={{ color: "#16a34a" }}>{stats.presentToday}</p>
                </div>
                <div className="card">
                  <h3>Absent Today</h3>
                  <p style={{ color: "#ef4444" }}>{stats.absentToday}</p>
                </div>
                <div className="card">
                  <h3>Pending Leaves</h3>
                  <p style={{ color: "#f59e0b" }}>{stats.pendingLeaves}</p>
                </div>
                <div className="card">
                  <h3>Open Complaints</h3>
                  <p style={{ color: "#ef4444" }}>{stats.openComplaints}</p>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="page-box">
                <div className="box-title">
                  <span>Mark Student Attendance</span>
                  <div>
                    <label style={{ fontSize: "13px", marginRight: "8px", fontWeight: "600" }}>Date:</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Room</th>
                      <th>PG</th>
                      <th>Current Status ({attendanceDate})</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const record = dailyAttendance.find(a => a.student?.id === s.id);
                      return (
                        <tr key={s.id}>
                          <td><strong>{s.user?.name}</strong></td>
                          <td>{s.room ? `Room ${s.room.roomNumber}` : "Unassigned"}</td>
                          <td>{s.pg?.name || "N/A"}</td>
                          <td>
                            {record ? (
                              <span className={`badge ${record.status === "PRESENT" ? "badge-success" : "badge-danger"}`}>
                                {record.status}
                              </span>
                            ) : (
                              <span className="badge badge-warning">NOT MARKED</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-sm btn-success"
                              onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                            >
                              Present
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                            >
                              Absent
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "leaves" && (
              <div className="page-box">
                <div className="box-title">Student Leave Requests</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.student?.user?.name || "Student #" + l.student?.id}</strong></td>
                        <td>{l.startDate}</td>
                        <td>{l.endDate}</td>
                        <td>{l.reason}</td>
                        <td>
                          <span className={`badge ${
                            l.status === "APPROVED" ? "badge-success" :
                            l.status === "REJECTED" ? "badge-danger" : "badge-warning"
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          {l.status === "PENDING" && (
                            <>
                              <button className="btn-sm btn-success" onClick={() => handleUpdateLeave(l.id, "APPROVED")}>
                                Approve
                              </button>
                              <button className="btn-sm btn-danger" onClick={() => handleUpdateLeave(l.id, "REJECTED")}>
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="page-box">
                <div className="box-title">Student Complaints</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.student?.user?.name || "Student #" + c.student?.id}</strong></td>
                        <td>{c.title}</td>
                        <td>{c.description}</td>
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
                            <button className="btn-sm btn-secondary" onClick={() => handleUpdateComplaint(c.id, "IN_PROGRESS")}>
                              In Progress
                            </button>
                          )}
                          {c.status !== "RESOLVED" && (
                            <button className="btn-sm btn-success" onClick={() => handleUpdateComplaint(c.id, "RESOLVED")}>
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

            {activeTab === "students" && (
              <div className="page-box">
                <div className="box-title">All Hostellers</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>PG</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.user?.name}</strong></td>
                        <td>{s.user?.email}</td>
                        <td>{s.pg?.name || "N/A"}</td>
                        <td>{s.room ? `Room ${s.room.roomNumber}` : "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 style={{ marginTop: "30px", marginBottom: "15px", fontSize: "16px" }}>Room Occupancy Overview</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Capacity</th>
                      <th>Occupied</th>
                      <th>Status</th>
                      <th>Monthly Rent</th>
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

export default WardenDashboard;
