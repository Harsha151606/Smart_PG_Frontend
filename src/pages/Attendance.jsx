import React from "react";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();

  // Temporary attendance data
  const attendance = [
    {
      date: "23 Sep 2026",
      day: "Wednesday",
      status: "Present"
    },
    {
      date: "22 Sep 2026",
      day: "Tuesday",
      status: "Present"
    },
    {
      date: "21 Sep 2026",
      day: "Monday",
      status: "Absent"
    },
    {
      date: "20 Sep 2026",
      day: "Sunday",
      status: "Holiday"
    },
    {
      date: "19 Sep 2026",
      day: "Saturday",
      status: "Present"
    },
    {
      date: "18 Sep 2026",
      day: "Friday",
      status: "Present"
    }
  ];

  const totalDays = 5;
  const presentDays = 4;
  const absentDays = 1;

  const percentage = Math.round(
    (presentDays / totalDays) * 100
  );

  return (
    <div className="page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h2>Smart PG</h2>
          <p>Attendance</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>

      {/* Content */}
      <main className="page-content">

        <h1>Attendance 📋</h1>

        <p className="page-description">
          View your attendance summary and history.
        </p>

        {/* Summary */}
        <div className="attendance-summary">

          <div className="attendance-card">
            <span>Total Days</span>
            <strong>{totalDays}</strong>
          </div>

          <div className="attendance-card">
            <span>Present</span>
            <strong>{presentDays}</strong>
          </div>

          <div className="attendance-card">
            <span>Absent</span>
            <strong>{absentDays}</strong>
          </div>

          <div className="attendance-card">
            <span>Attendance</span>
            <strong>{percentage}%</strong>
          </div>

        </div>

        {/* Attendance History */}
        <div className="attendance-table-section">

          <h2>Attendance History</h2>

          <table className="attendance-table">

            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {attendance.map((record, index) => (

                <tr key={index}>

                  <td>{record.date}</td>

                  <td>{record.day}</td>

                  <td>
                    <span
                      className={`attendance-status ${record.status.toLowerCase()}`}
                    >
                      {record.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
}

export default Attendance;