import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import {
  DashboardIcon,
  AttendanceIcon,
  LeaveIcon,
  UsersIcon,
  ComplaintIcon,
  BedIcon
} from "../components/Icons";

function WardenDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    if (location.pathname === "/manage-attendance") return "attendance";
    if (location.pathname === "/manage-leaves") return "leaves";
    if (location.pathname === "/view-students") return "students";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
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

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === "/manage-attendance") setActiveTab("attendance");
    else if (location.pathname === "/manage-leaves") setActiveTab("leaves");
    else if (location.pathname === "/view-students") setActiveTab("students");
    else if (location.pathname === "/manage-complaints") setActiveTab("complaints");
    else if (location.pathname === "/warden") setActiveTab("overview");
  }, [location.pathname]);

  useEffect(() => {
    fetchWardenData(false);
    const interval = setInterval(() => {
      fetchWardenData(true);
      fetchAttendanceForDate(attendanceDate);
    }, 5000);
    return () => clearInterval(interval);
  }, [attendanceDate]);

  useEffect(() => {
    fetchAttendanceForDate(attendanceDate);
  }, [attendanceDate]);

  const fetchWardenData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, studentsRes, roomsRes, leavesRes, complaintsRes] = await Promise.all([
        api.get("/warden/stats").catch(() => ({ data: null })),
        api.get("/warden/students").catch(() => ({ data: [] })),
        api.get("/warden/rooms").catch(() => ({ data: [] })),
        api.get("/leaves").catch(() => ({ data: [] })),
        api.get("/complaints").catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setStudents(studentsRes.data || []);
      setRooms(roomsRes.data || []);
      setLeaves(leavesRes.data || []);
      setComplaints(complaintsRes.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) {
        setError("Failed to load Warden operational logs.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const res = await api.get(`/attendance/date/${date}`);
      setDailyAttendance(res.data || []);
    } catch (err) {
      setDailyAttendance([]);
    }
  };

  const handleTabChange = (tab, route) => {
    setActiveTab(tab);
    navigate(route);
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
      setSuccess(`Attendance recorded: Student marked ${status}!`);
      fetchAttendanceForDate(attendanceDate);
      fetchWardenData(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record attendance.");
    }
  };

  const handleUpdateLeave = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/leaves/${id}/status?status=${status}`);
      setSuccess(`Leave request #${id} marked as ${status}!`);
      fetchWardenData(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update leave request.");
    }
  };

  const handleUpdateComplaint = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/complaints/${id}/status?status=${status}`);
      setSuccess(`Complaint #${id} updated to ${status}!`);
      fetchWardenData(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update complaint status.");
    }
  };

  // Helper map for date's attendance
  const attendanceMap = {};
  dailyAttendance.forEach((a) => {
    if (a.student?.id) {
      attendanceMap[a.student.id] = a.status;
    }
  });

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Warden Dashboard <span>📋</span>
          </h2>
          <div className="header-subtitle">
            Daily student attendance logging, leave request evaluations, and resident directory.
          </div>
        </div>

        <div className="header-actions">
          <button onClick={fetchWardenData} className="btn-grand btn-secondary-grand btn-sm-grand">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div className="panel-card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading warden operations records...
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
          onClick={() => handleTabChange("overview", "/warden")}
        >
          <DashboardIcon size={16} />
          Overview
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => handleTabChange("attendance", "/manage-attendance")}
        >
          <AttendanceIcon size={16} />
          Daily Attendance
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "leaves" ? "active" : ""}`}
          onClick={() => handleTabChange("leaves", "/manage-leaves")}
        >
          <LeaveIcon size={16} />
          Leave Requests
          <span className="tab-badge">{leaves.filter((l) => l.status === "PENDING").length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => handleTabChange("students", "/view-students")}
        >
          <UsersIcon size={16} />
          Resident Directory
          <span className="tab-badge">{students.length}</span>
        </button>

        <button
          className={`voyage-tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => handleTabChange("complaints", "/manage-complaints")}
        >
          <ComplaintIcon size={16} />
          Complaints
          <span className="tab-badge">{complaints.length}</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && stats && (
        <div className="stat-grid">
          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Total Residents</div>
              <div className="stat-value">{stats.totalStudents || students.length}</div>
              <div className="stat-subtext">Students housed</div>
            </div>
            <div className="stat-icon-crest navy">
              <UsersIcon size={24} />
            </div>
          </div>

          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Present Today</div>
              <div className="stat-value" style={{ color: "var(--emerald-600)" }}>
                {stats.presentToday || 0}
              </div>
              <div className="stat-subtext">Verified on campus</div>
            </div>
            <div className="stat-icon-crest emerald">
              <span>✓</span>
            </div>
          </div>

          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Absent Today</div>
              <div className="stat-value" style={{ color: "var(--crimson-600)" }}>
                {stats.absentToday || 0}
              </div>
              <div className="stat-subtext">On leave or absent</div>
            </div>
            <div className="stat-icon-crest navy">
              <span>⚠️</span>
            </div>
          </div>

          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Pending Leaves</div>
              <div className="stat-value" style={{ color: "var(--gold-600)" }}>
                {stats.pendingLeaves || 0}
              </div>
              <div className="stat-subtext">Awaiting warden review</div>
            </div>
            <div className="stat-icon-crest gold">
              <LeaveIcon size={24} />
            </div>
          </div>

          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Open Complaints</div>
              <div className="stat-value">{stats.openComplaints || 0}</div>
              <div className="stat-subtext">Requires attention</div>
            </div>
            <div className="stat-icon-crest navy">
              <ComplaintIcon size={24} />
            </div>
          </div>

          <div className="stat-card-deck">
            <div className="stat-info">
              <div className="stat-label">Total Rooms</div>
              <div className="stat-value">{stats.totalRooms || rooms.length}</div>
              <div className="stat-subtext">Monitored spaces</div>
            </div>
            <div className="stat-icon-crest gold">
              <BedIcon size={24} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE MANAGEMENT */}
      {activeTab === "attendance" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <AttendanceIcon size={18} />
              Daily Attendance Logging
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--navy-900)" }}>Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="form-input-grand"
                style={{ padding: "6px 10px", width: "170px" }}
              />
            </div>
          </div>

          <div className="panel-card-body">
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Assigned Room</th>
                    <th>Status on {attendanceDate}</th>
                    <th style={{ textAlign: "right" }}>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No students enrolled to record attendance.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => {
                      const currentStatus = attendanceMap[s.id];
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{s.user?.name}</td>
                          <td style={{ color: "var(--text-muted)" }}>{s.user?.email}</td>
                          <td>
                            {s.room ? (
                              <span className="badge-grand badge-in_progress">
                                Room {s.room.roomNumber}
                              </span>
                            ) : (
                              <span className="badge-grand badge-warning">Unassigned</span>
                            )}
                          </td>
                          <td>
                            {currentStatus === "PRESENT" ? (
                              <span className="badge-grand badge-present">✓ PRESENT</span>
                            ) : currentStatus === "ABSENT" ? (
                              <span className="badge-grand badge-absent">✗ ABSENT</span>
                            ) : (
                              <span className="badge-grand badge-warning">⚪ NOT MARKED</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleMarkAttendance(s.id, "PRESENT")}
                              className={`btn-grand btn-sm-grand ${currentStatus === "PRESENT" ? "btn-primary-grand" : "btn-secondary-grand"}`}
                              style={{ marginRight: "6px" }}
                            >
                              ✓ Present
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(s.id, "ABSENT")}
                              className={`btn-grand btn-sm-grand ${currentStatus === "ABSENT" ? "btn-danger-grand" : "btn-secondary-grand"}`}
                            >
                              ✗ Absent
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

      {/* TAB 3: LEAVE REQUESTS */}
      {activeTab === "leaves" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <LeaveIcon size={18} />
              Student Leave Requests
            </h3>
          </div>

          <div className="panel-card-body">
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>Request #</th>
                    <th>Student Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No leave requests submitted.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((l) => (
                      <tr key={l.id}>
                        <td><strong>#{l.id}</strong></td>
                        <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{l.student?.user?.name || "Student"}</td>
                        <td>{l.startDate}</td>
                        <td>{l.endDate}</td>
                        <td style={{ color: "var(--text-secondary)", maxWidth: "250px" }}>{l.reason}</td>
                        <td>
                          <span
                            className={`badge-grand ${
                              l.status === "APPROVED"
                                ? "badge-approved"
                                : l.status === "REJECTED"
                                ? "badge-rejected"
                                : "badge-pending"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {l.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleUpdateLeave(l.id, "APPROVED")}
                                className="btn-grand btn-primary-grand btn-sm-grand"
                                style={{ marginRight: "6px" }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateLeave(l.id, "REJECTED")}
                                className="btn-grand btn-danger-grand btn-sm-grand"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>
                              Completed
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

      {/* TAB 4: RESIDENT DIRECTORY */}
      {activeTab === "students" && (
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>
              <UsersIcon size={18} />
              Student Resident Directory
            </h3>
          </div>

          <div className="panel-card-body">
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Assigned Room</th>
                    <th>PG Property</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No students enrolled in the directory.
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
                            <span className="badge-grand badge-in_progress">
                              Room {s.room.roomNumber}
                            </span>
                          ) : (
                            <span className="badge-grand badge-warning">Unassigned</span>
                          )}
                        </td>
                        <td>{s.pg?.name || "General"}</td>
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
              Hostel Facility Complaints
            </h3>
          </div>

          <div className="panel-card-body">
            <div className="table-responsive">
              <table className="grand-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        No complaints logged for this hostel.
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
                                onClick={() => handleUpdateComplaint(c.id, "IN_PROGRESS")}
                                className="btn-grand btn-secondary-grand btn-sm-grand"
                                style={{ marginRight: "6px" }}
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleUpdateComplaint(c.id, "RESOLVED")}
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
    </Layout>
  );
}

export default WardenDashboard;
