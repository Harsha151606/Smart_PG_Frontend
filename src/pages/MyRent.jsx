import React from "react";
import { useNavigate } from "react-router-dom";

function MyRent() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>My Rent</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main className="page-content">

        <h1>My Rent 💰</h1>

        <p className="page-description">
          View your rent and payment status.
        </p>

        <div className="rent-card">

          <div className="rent-header">
            <div>
              <span>Current Month</span>
              <h2>September 2026</h2>
            </div>

            <div className="paid-badge">
              PAID
            </div>
          </div>

          <div className="rent-details">

            <div>
              <span>Monthly Rent</span>
              <strong>₹8,000</strong>
            </div>

            <div>
              <span>Amount Paid</span>
              <strong>₹8,000</strong>
            </div>

            <div>
              <span>Amount Due</span>
              <strong>₹0</strong>
            </div>

            <div>
              <span>Due Date</span>
              <strong>5th September</strong>
            </div>

          </div>

        </div>

        <div className="payment-status">

          <h2>Payment Status</h2>

          <p>
            🟢 Your rent has been paid for this month.
          </p>

        </div>

      </main>

    </div>
  );
}

export default MyRent;