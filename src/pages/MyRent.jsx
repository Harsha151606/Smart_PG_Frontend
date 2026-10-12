import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { PaymentIcon, BedIcon } from "../components/Icons";

function MyRent() {
  const [payments, setPayments] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = async (studentId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/payments/student/${studentId}`);
      setPayments(res.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.error || "Could not load rent payment history.");
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
        loadPayments(s.id, false);

        // Automatically update payments in real-time
        pollInterval = setInterval(() => {
          if (activeStudentId) {
            loadPayments(activeStudentId, true);
          }
        }, 5000);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Could not load rent payment history.");
        setLoading(false);
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0);

  const room = student?.room;

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Rent & Payment History <span>💳</span>
          </h2>
          <div className="header-subtitle">
            Review your monthly room rent, payment status, and official transaction receipts.
          </div>
        </div>
      </div>

      {loading && (
        <div className="panel-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading payment history...
        </div>
      )}

      {error && (
        <div className="feedback-banner feedback-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat Overview Cards */}
          <div className="stat-grid">
            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Monthly Room Rent</div>
                <div className="stat-value" style={{ color: "var(--gold-600)" }}>
                  ₹{room?.rent ? room.rent.toLocaleString() : "0"}
                </div>
                <div className="stat-subtext">Due each billing cycle</div>
              </div>
              <div className="stat-icon-crest gold">
                <PaymentIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Assigned Room</div>
                <div className="stat-value">{room ? `Room ${room.roomNumber}` : "Unallocated"}</div>
                <div className="stat-subtext">{student?.pg?.name || "General Facility"}</div>
              </div>
              <div className="stat-icon-crest navy">
                <BedIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Total Amount Paid</div>
                <div className="stat-value" style={{ color: "var(--emerald-600)" }}>
                  ₹{totalPaid.toLocaleString()}
                </div>
                <div className="stat-subtext">{payments.length} recorded payments</div>
              </div>
              <div className="stat-icon-crest emerald">
                <span>✓</span>
              </div>
            </div>
          </div>

          {/* Payment Receipts Table */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>
                <PaymentIcon size={18} />
                Payment Transaction Receipts
              </h3>
            </div>

            <div className="panel-card-body">
              <div className="table-responsive">
                <table className="grand-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Amount Paid</th>
                      <th>Payment Status</th>
                      <th>Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          No recorded rent transactions on your account yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id}>
                          <td><strong>#{p.id}</strong></td>
                          <td style={{ fontWeight: "800", color: "var(--gold-600)", fontSize: "15px" }}>
                            ₹{p.amount ? p.amount.toLocaleString() : 0}
                          </td>
                          <td>
                            <span className={`badge-grand ${p.status === "PAID" ? "badge-paid" : "badge-pending"}`}>
                              {p.status || "PAID"}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-muted)" }}>
                            {p.paymentDate ? p.paymentDate.split("T")[0] : "Verified Transaction"}
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

export default MyRent;