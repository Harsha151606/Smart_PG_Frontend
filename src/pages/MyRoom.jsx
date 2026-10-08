import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function MyRoom() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/student/me")
      .then(res => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || "Could not load room data.");
        setLoading(false);
      });
  }, []);

  const room = student?.room;
  const pg = student?.pg;

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>My Room</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>My Room 🛏️</h1>
        <p className="page-description">View your room details.</p>

        {loading && <p>Loading room details...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && !room && (
          <div className="empty-state">
            <p>🚫 You have not been assigned a room yet. Please contact your owner or warden.</p>
          </div>
        )}

        {!loading && room && (
          <>
            <div className="room-card">
              <h2>Room {room.roomNumber}</h2>
              <div className="room-details">
                <div>
                  <span>Capacity</span>
                  <strong>{room.capacity} Members</strong>
                </div>
                <div>
                  <span>Occupied</span>
                  <strong>{room.occupied} / {room.capacity}</strong>
                </div>
                <div>
                  <span>Monthly Rent</span>
                  <strong>₹{room.rent?.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Available</span>
                  <strong>{room.available ? "Yes" : "No"}</strong>
                </div>
              </div>
            </div>

            {pg && (
              <div className="room-card" style={{ marginTop: "1rem" }}>
                <h2>PG Details 🏢</h2>
                <div className="room-details">
                  <div>
                    <span>PG Name</span>
                    <strong>{pg.name}</strong>
                  </div>
                  <div>
                    <span>Address</span>
                    <strong>{pg.address}</strong>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyRoom;