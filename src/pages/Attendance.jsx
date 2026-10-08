import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Attendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/student/me")
      .then(res => {
        const s = res.data;
        setStudent(s);
        return api.get(`/attendance/student/${s.id}`);
      })
      .then(res => {
        setAttendance(res.data);
        setLoading(false);
      })
      .catch(err => {
        // If student not found or no attendance, still continue
        setLoading(false);
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error || "Could not load attendance.");
        }
      });
  }, []);

  const present = attendance.filter(a => a.status === "PRESENT").length;
  const absent = attendance.filter(a => a.status === "ABSENT").length;
  const total = attendance.length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Attendance</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Attendance 📋</h1>
        <p className="page-description">
          {student ? `Attendance records for ${student.user?.name}` : "View your attendance summary and history."}
        </p>

        {loading && <p>Loading attendance...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="attendance-summary">
              <div className="attendance-card">
                <span>Total Days</span>
                <strong>{total}</strong>
              </div>
              <div className="attendance-card">
                <span>Present</span>
                <strong>{present}</strong>
              </div>
              <div className="attendance-card">
                <span>Absent</span>
                <strong>{absent}</strong>
              </div>
              <div className="attendance-card">
                <span>Attendance %</span>
                <strong>{percentage}%</strong>
              </div>
            </div>

            <div className="attendance-table-section">
              <h2>Attendance History</h2>
              {attendance.length === 0 ? (
                <div className="empty-state">
                  <p>No attendance records found. Your warden will mark attendance here.</p>
                </div>
              ) : (
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>
                          <span className={`attendance-status ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Attendance;