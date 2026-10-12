import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { AttendanceIcon } from "../components/Icons";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async (studentId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/attendance/student/${studentId}`);
      setAttendance(res.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent && err.response?.status !== 404) {
        setError(err.response?.data?.error || "Could not load attendance logs.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let activeStudentId = null;
    let pollInterval = null;

    api.get("/student/me")
      .then((res) => {
        const s = res.data;
        setStudent(s);
        activeStudentId = s.id;
        loadAttendance(s.id, false);

        // Automatically update attendance records in real-time
        pollInterval = setInterval(() => {
          if (activeStudentId) {
            loadAttendance(activeStudentId, true);
          }
        }, 5000);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error || "Could not load attendance logs.");
        }
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const total = attendance.length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Student Attendance Record <span>📋</span>
          </h2>
          <div className="header-subtitle">
            {student ? `Roll-call logs for ${student.user?.name || "Student"}. ` : ""}
            Daily attendance status recorded by your hostel warden.
          </div>
        </div>
      </div>

      {loading && (
        <div className="panel-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading attendance records...
        </div>
      )}

      {error && (
        <div className="feedback-banner feedback-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Attendance Metric Cards */}
          <div className="stat-grid">
            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Attendance Percentage</div>
                <div className="stat-value" style={{ color: percentage >= 75 ? "var(--emerald-600)" : "var(--crimson-600)" }}>
                  {percentage}%
                </div>
                <div className="stat-subtext">{percentage >= 75 ? "Good Standing" : "Low Attendance Warning"}</div>
              </div>
              <div className="stat-icon-crest emerald">
                <AttendanceIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Days Present</div>
                <div className="stat-value" style={{ color: "var(--emerald-600)" }}>
                  {present} Days
                </div>
                <div className="stat-subtext">Verified on campus</div>
              </div>
              <div className="stat-icon-crest emerald">
                <span>✓</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Days Absent</div>
                <div className="stat-value" style={{ color: "var(--crimson-600)" }}>
                  {absent} Days
                </div>
                <div className="stat-subtext">Leave or unexcused absence</div>
              </div>
              <div className="stat-icon-crest navy">
                <span>⚠️</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Days Recorded</div>
                <div className="stat-value">{total} Days</div>
                <div className="stat-subtext">Recorded sessions</div>
              </div>
              <div className="stat-icon-crest gold">
                <span>📅</span>
              </div>
            </div>
          </div>

          {/* Historical Log Table */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>
                <AttendanceIcon size={18} />
                Attendance Log History
              </h3>
            </div>

            <div className="panel-card-body">
              <div className="table-responsive">
                <table className="grand-table">
                  <thead>
                    <tr>
                      <th>Record #</th>
                      <th>Date</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No attendance records logged yet for your profile.
                        </td>
                      </tr>
                    ) : (
                      attendance.map((a, idx) => (
                        <tr key={a.id || idx}>
                          <td><strong>#{a.id || idx + 1}</strong></td>
                          <td style={{ fontWeight: "600", color: "var(--navy-900)" }}>{a.date}</td>
                          <td>
                            {a.status === "PRESENT" ? (
                              <span className="badge-grand badge-present">✓ PRESENT</span>
                            ) : (
                              <span className="badge-grand badge-absent">✗ ABSENT</span>
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
    </Layout>
  );
}

export default Attendance;