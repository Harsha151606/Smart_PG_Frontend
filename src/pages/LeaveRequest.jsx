import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LeaveRequest() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const submitLeave = (e) => {
    e.preventDefault();

    if (!fromDate || !toDate || !reason) {
      setMessage("Please fill all fields.");
      return;
    }

    const leaveRequest = {
      fromDate,
      toDate,
      reason,
      status: "Pending"
    };

    const requests =
      JSON.parse(localStorage.getItem("leaveRequests")) || [];

    requests.push(leaveRequest);

    localStorage.setItem(
      "leaveRequests",
      JSON.stringify(requests)
    );

    setFromDate("");
    setToDate("");
    setReason("");

    setMessage("Leave request submitted successfully!");
  };

  return (
    <div className="page">

      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Leave Request</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main className="page-content">

        <h1>Leave Request 📝</h1>

        <div className="complaint-box">

          <h2>Apply for Leave</h2>

          <form onSubmit={submitLeave}>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <textarea
              placeholder="Reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            {message && <p>{message}</p>}

            <button type="submit">
              Submit Request
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default LeaveRequest;