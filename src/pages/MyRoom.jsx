import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { BedIcon, BuildingIcon, UsersIcon } from "../components/Icons";

function MyRoom() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/student/me")
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Could not load room assignment details.");
        setLoading(false);
      });
  }, []);

  const room = student?.room;
  const pg = student?.pg;

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            My Room Details <span>🛏️</span>
          </h2>
          <div className="header-subtitle">
            Personal room allocation, capacity details, and property contact information.
          </div>
        </div>
      </div>

      {loading && (
        <div className="panel-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading room details...
        </div>
      )}

      {error && (
        <div className="feedback-banner feedback-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && !room && (
        <div className="empty-deck-state">
          <div className="empty-deck-icon">🚪</div>
          <h4>No Room Assigned Yet</h4>
          <p>
            You are enrolled in the student database, but your property owner has not yet allocated a room to your profile.
          </p>
          <span className="badge-grand badge-warning">Awaiting Room Allocation</span>
        </div>
      )}

      {!loading && room && (
        <>
          {/* Main Room Stat Grid */}
          <div className="stat-grid">
            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Room Number</div>
                <div className="stat-value">Room {room.roomNumber}</div>
                <div className="stat-subtext">Active Assignment</div>
              </div>
              <div className="stat-icon-crest emerald">
                <BedIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Bed Capacity</div>
                <div className="stat-value">{room.capacity || 1} Persons</div>
                <div className="stat-subtext">{room.occupied || 1} currently occupied</div>
              </div>
              <div className="stat-icon-crest navy">
                <UsersIcon size={24} />
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">Monthly Rent</div>
                <div className="stat-value" style={{ color: "var(--gold-600)" }}>
                  ₹{room.rent ? room.rent.toLocaleString() : "N/A"}
                </div>
                <div className="stat-subtext">Tariff per cycle</div>
              </div>
              <div className="stat-icon-crest gold">
                <span>💳</span>
              </div>
            </div>

            <div className="stat-card-deck">
              <div className="stat-info">
                <div className="stat-label">PG Property</div>
                <div className="stat-value" style={{ fontSize: "20px" }}>{pg?.name || "Standard PG"}</div>
                <div className="stat-subtext">{pg?.address || "Main Building"}</div>
              </div>
              <div className="stat-icon-crest gold">
                <BuildingIcon size={24} />
              </div>
            </div>
          </div>

          {/* Room Specifications Panel */}
          <div className="panel-card">
            <div className="panel-card-header">
              <h3>
                <BuildingIcon size={18} />
                Accommodation Details & Guidelines
              </h3>
            </div>
            <div className="panel-card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                <div style={{ background: "var(--bg-parchment)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-parchment)" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--navy-900)", marginBottom: "8px" }}>
                    Room Summary
                  </h4>
                  <ul style={{ listStyle: "none", fontSize: "13.5px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                    <li><strong>Room ID:</strong> #{room.id}</li>
                    <li><strong>Room Number:</strong> {room.roomNumber}</li>
                    <li><strong>Hostel Name:</strong> {pg?.name || "General Facility"}</li>
                    <li><strong>Address:</strong> {pg?.address || "Main Hostel Campus"}</li>
                  </ul>
                </div>

                <div style={{ background: "var(--bg-parchment)", padding: "18px", borderRadius: "10px", border: "1px solid var(--border-parchment)" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--navy-900)", marginBottom: "8px" }}>
                    Living Guidelines
                  </h4>
                  <ul style={{ listStyle: "none", fontSize: "13.5px", lineHeight: "1.8", color: "var(--text-secondary)" }}>
                    <li>✓ Daily attendance roll-call is marked by the warden.</li>
                    <li>✓ Maintain clean quarters and avoid damage to hostel property.</li>
                    <li>✓ Submit leave applications prior to overnight absence.</li>
                    <li>✓ Report maintenance or facility issues via the complaints portal.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default MyRoom;