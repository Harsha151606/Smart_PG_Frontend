import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function LeaveRequest() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" or "error"
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/me")
      .then(res => {
        const s = res.data;
        setStudent(s);
        return api.get(`/leaves/student/${s.id}`);
      })
      .then(res => {
        setLeaveRequests(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const submitLeave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fromDate || !toDate || !reason) {
      setMsgType("error");
      setMessage("Please fill all fields.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setMsgType("error");
      setMessage("End date cannot be before start date.");
      return;
    }

    try {
      const res = await api.post("/leaves", {
        studentId: student.id,
        startDate: fromDate,
        endDate: toDate,
        reason
      });
      setLeaveRequests([...leaveRequests, res.data]);
      setFromDate("");
      setToDate("");
      setReason("");
      setMsgType("success");
      setMessage("Leave request submitted successfully!");
    } catch (err) {
      setMsgType("error");
      setMessage(err.response?.data?.error || "Failed to submit leave request.");
    }
  };

  const statusBadge = (status) => {
    const map = { PENDING: "pending", APPROVED: "present", REJECTED: "absent" };
    return map[status] || "pending";
  };

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Leave Request</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Leave Request 📝</h1>

        {loading && <p>Loading...</p>}

        {!loading && (
          <>
            <div className="complaint-form-card">
              <h2>Apply for Leave</h2>
              <form onSubmit={submitLeave}>
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <label>Reason</label>
                <textarea
                  placeholder="Reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="4"
                />
                {message && (
                  <p className={msgType === "success" ? "success" : "error"}>{message}</p>
                )}
                <button type="submit" disabled={!student}>
                  {student ? "Submit Request" : "Loading profile..."}
                </button>
              </form>
            </div>

            <div className="complaints-list">
              <h2>My Leave Requests</h2>
              {leaveRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No leave requests submitted yet.</p>
                </div>
              ) : (
                leaveRequests.map((req) => (
                  <div className="complaint-card" key={req.id}>
                    <div className="complaint-header">
                      <div>
                        <h3>{req.startDate} → {req.endDate}</h3>
                        <small>{req.reason}</small>
                      </div>
                      <span className={`attendance-status ${statusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default LeaveRequest;