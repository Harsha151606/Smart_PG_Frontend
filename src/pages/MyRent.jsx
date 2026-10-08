import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function MyRent() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/student/me")
      .then(res => {
        const s = res.data;
        setStudent(s);
        return api.get(`/payments/student/${s.id}`);
      })
      .then(res => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || "Could not load payment data.");
        setLoading(false);
      });
  }, []);

  const latestPayment = payments[payments.length - 1];

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>My Rent</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>My Rent 💰</h1>
        <p className="page-description">View your rent and payment history.</p>

        {loading && <p>Loading payment data...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            {student?.room && (
              <div className="rent-card">
                <div className="rent-header">
                  <div>
                    <span>Room</span>
                    <h2>{student.room.roomNumber}</h2>
                  </div>
                  <div>
                    <span>Monthly Rent</span>
                    <h2>₹{student.room.rent?.toLocaleString()}</h2>
                  </div>
                  {latestPayment && (
                    <div className={`paid-badge ${latestPayment.status === "PAID" ? "paid" : "pending"}`}>
                      {latestPayment.status}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="complaints-list" style={{ marginTop: "1.5rem" }}>
              <h2>Payment History</h2>
              {payments.length === 0 ? (
                <div className="empty-state">
                  <p>No payments recorded yet.</p>
                </div>
              ) : (
                <table className="attendance-table" style={{ width: "100%", marginTop: "1rem" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <tr key={p.id}>
                        <td>{idx + 1}</td>
                        <td>₹{Number(p.amount).toLocaleString()}</td>
                        <td>{p.date}</td>
                        <td>
                          <span className={`attendance-status ${p.status.toLowerCase()}`}>
                            {p.status}
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

export default MyRent;