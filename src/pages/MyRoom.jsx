import React from "react";
import { useNavigate } from "react-router-dom";

function MyRoom() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>My Room</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      <main className="page-content">

        <h1>My Room 🛏️</h1>

        <p className="page-description">
          View your room details and roommates.
        </p>

        <div className="room-card">

          <h2>Room A-101</h2>

          <div className="room-details">

            <div>
              <span>Floor</span>
              <strong>1st Floor</strong>
            </div>

            <div>
              <span>Capacity</span>
              <strong>3 Members</strong>
            </div>

            <div>
              <span>Occupied</span>
              <strong>2 / 3</strong>
            </div>

            <div>
              <span>Monthly Rent</span>
              <strong>₹8,000</strong>
            </div>

          </div>

        </div>

        <div className="room-status">

          <h2>Room Status</h2>

          <p>
            🟢 Room is currently available for 1 more member.
          </p>

        </div>

      </main>

    </div>
  );
}

export default MyRoom;