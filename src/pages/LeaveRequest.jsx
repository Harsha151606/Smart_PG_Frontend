import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { LeaveIcon } from "../components/Icons";

function LeaveRequest() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async (studentId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/leaves/student/${studentId}`);
      setLeaveRequests(res.data || []);
    } catch (err) {
      // ignore in background
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
        loadLeaves(s.id, false);

        // Automatically update leave approval statuses in real-time
        pollInterval = setInterval(() => {
          if (activeStudentId) {
            loadLeaves(activeStudentId, true);
          }
        }, 5000);
      })
      .catch((err) => {
        setLoading(false);
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const submitLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fromDate || !toDate || !reason) {
      setMsgType("error");
      setMessage("Please fill in all required travel dates and the reason for leave.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setMsgType("error");
      setMessage("Return date cannot be earlier than departure date.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/leaves", {
        studentId: student.id,
        startDate: fromDate,
        endDate: toDate,
        reason
      });
      setFromDate("");
      setToDate("");
      setReason("");
      setMsgType("success");
      setMessage("Leave request submitted successfully for warden evaluation!");
      loadLeaves(student.id, true);
    } catch (err) {
      setMsgType("error");
      setMessage(err.response?.data?.error || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Student Leave Requests <span>📑</span>
          </h2>
          <div className="header-subtitle">
            Request permission for temporary hostel absence, vacation, or overnight visits.
          </div>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div className="panel-card" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading leave request records...
        </div>
      )}
      {message && (
        <div className={`feedback-banner ${msgType === "success" ? "feedback-success" : "feedback-error"}`}>
          <span>{msgType === "success" ? "✓" : "⚠️"}</span> {message}
        </div>
      )}

      {/* Leave Application Form */}
      <div className="panel-card" style={{ borderLeft: "4px solid var(--ocean-600)" }}>
        <div className="panel-card-header">
          <h3>
            <LeaveIcon size={18} />
            Apply for Student Leave
          </h3>
        </div>

        <div className="panel-card-body">
          <form onSubmit={submitLeave}>
            <div className="form-grid-2">
              <div className="form-field-group">
                <label className="form-label-grand">Departure Date (From)</label>
                <input
                  type="date"
                  className="form-input-grand"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label-grand">Return Date (To)</label>
                <input
                  type="date"
                  className="form-input-grand"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label-grand">Reason for Leave & Destination</label>
              <textarea
                className="form-textarea-grand"
                rows="3"
                placeholder="State destination, emergency contact, or leave details (e.g. Visiting family / Medical appointment)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-grand btn-primary-grand"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Leave Application"}
            </button>
          </form>
        </div>
      </div>

      {/* History Table */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>
            <LeaveIcon size={18} />
            My Leave Request History
          </h3>
        </div>

        <div className="panel-card-body">
          <div className="table-responsive">
            <table className="grand-table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Departure Date</th>
                  <th>Return Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((l) => (
                    <tr key={l.id}>
                      <td><strong>#{l.id}</strong></td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td style={{ color: "var(--text-secondary)", maxWidth: "300px" }}>{l.reason}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LeaveRequest;