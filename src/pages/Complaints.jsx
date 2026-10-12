import React, { useState, useEffect } from "react";
import api from "../api";
import Layout from "../components/Layout";
import { ComplaintIcon } from "../components/Icons";

function Complaints() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = async (studentId, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/complaints/student/${studentId}`);
      setComplaints(res.data || []);
      if (!silent) setError("");
    } catch (err) {
      if (!silent && err.response?.status !== 404) {
        setError(err.response?.data?.error || "Could not load complaint tickets.");
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
        loadComplaints(s.id, false);

        // Automatically update complaint statuses in real-time
        pollInterval = setInterval(() => {
          if (activeStudentId) {
            loadComplaints(activeStudentId, true);
          }
        }, 5000);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.status !== 404) {
          setError(err.response?.data?.error || "Could not load complaint tickets.");
        }
      });

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description) {
      setError("Please fill out both the complaint subject and details.");
      return;
    }
    if (description.length < 10) {
      setError("Description must contain at least 10 characters to assist maintenance.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/complaints", {
        studentId: student.id,
        title,
        description
      });
      setTitle("");
      setDescription("");
      setSuccess("Complaint ticket submitted successfully to the warden and owner!");
      loadComplaints(student.id, true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit complaint. Verify your student enrollment.");
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
            Complaints & Maintenance Requests <span>🛠️</span>
          </h2>
          <div className="header-subtitle">
            Report maintenance issues, plumbing faults, or living concerns for swift resolution.
          </div>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div className="panel-card" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading complaint tickets...
        </div>
      )}
      {error && (
        <div className="feedback-banner feedback-error">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="feedback-banner feedback-success">
          <span>✓</span> {success}
        </div>
      )}

      {/* New Complaint Form Panel */}
      <div className="panel-card" style={{ borderLeft: "4px solid var(--gold-500)" }}>
        <div className="panel-card-header">
          <h3>
            <ComplaintIcon size={18} />
            Submit New Complaint Ticket
          </h3>
        </div>
        <div className="panel-card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-field-group">
              <label className="form-label-grand">Complaint Subject / Category</label>
              <input
                type="text"
                className="form-input-grand"
                placeholder="e.g. Room 204 Fan Repair / Water Supply Issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label-grand">Detailed Description</label>
              <textarea
                className="form-textarea-grand"
                rows="4"
                placeholder="Describe the issue clearly so maintenance staff can resolve it quickly..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-grand btn-primary-grand"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Complaint Ticket"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Complaints Table */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>
            <ComplaintIcon size={18} />
            My Complaint History
          </h3>
        </div>
        <div className="panel-card-body">
          <div className="table-responsive">
            <table className="grand-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      No complaint tickets submitted. All facilities operating normally.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id}>
                      <td><strong>#{c.id}</strong></td>
                      <td style={{ fontWeight: "700", color: "var(--navy-900)" }}>{c.title}</td>
                      <td style={{ color: "var(--text-secondary)", maxWidth: "340px" }}>{c.description}</td>
                      <td>
                        <span
                          className={`badge-grand ${
                            c.status === "RESOLVED"
                              ? "badge-resolved"
                              : c.status === "IN_PROGRESS"
                              ? "badge-in_progress"
                              : "badge-open"
                          }`}
                        >
                          {c.status}
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

export default Complaints;