import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Complaints() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/student/me")
      .then(res => {
        const s = res.data;
        setStudent(s);
        return api.get(`/complaints/student/${s.id}`);
      })
      .then(res => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error || "Could not load complaints.");
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description) {
      setError("Please fill all fields.");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    try {
      const res = await api.post("/complaints", {
        studentId: student.id,
        title,
        description
      });
      setComplaints([...complaints, res.data]);
      setTitle("");
      setDescription("");
      setSuccess("Complaint submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit complaint.");
    }
  };

  const statusClass = (status) => {
    if (!status) return "";
    return status.toLowerCase().replace("_", "-");
  };

  return (
    <div className="page">
      <header className="dashboard-header">
        <div>
          <h2>Smart PG</h2>
          <p>Complaints</p>
        </div>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </header>

      <main className="page-content">
        <h1>Complaints 🛠️</h1>
        <p className="page-description">Submit and track your complaints.</p>

        {loading && <p>Loading complaints...</p>}

        {!loading && (
          <>
            <div className="complaint-form-card">
              <h2>Submit a Complaint</h2>
              <form onSubmit={handleSubmit}>
                <label>Complaint Title</label>
                <input
                  type="text"
                  placeholder="Enter complaint title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  placeholder="Describe your complaint in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                />
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <button type="submit" disabled={!student}>
                  {student ? "Submit Complaint" : "Loading profile..."}
                </button>
              </form>
            </div>

            <div className="complaints-list">
              <h2>My Complaints</h2>
              {complaints.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't submitted any complaints yet.</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div className="complaint-card" key={complaint.id}>
                    <div className="complaint-header">
                      <div>
                        <h3>{complaint.title}</h3>
                        <small>
                          Submitted on {complaint.createdAt
                            ? new Date(complaint.createdAt).toLocaleDateString()
                            : "—"}
                        </small>
                      </div>
                      <span className={`complaint-status ${statusClass(complaint.status)}`}>
                        {complaint.status?.replace("_", " ")}
                      </span>
                    </div>
                    <p>{complaint.description}</p>
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

export default Complaints;