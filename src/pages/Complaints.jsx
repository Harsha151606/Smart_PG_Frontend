import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Complaints() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [complaints, setComplaints] = useState(() => {
    const savedComplaints =
      JSON.parse(localStorage.getItem("complaints")) || [];

    return savedComplaints.filter(
      (complaint) =>
        complaint.userId === user?.id
    );
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title || !description) {
      setError("Please fill all fields.");
      return;
    }

    if (description.length < 10) {
      setError(
        "Description must contain at least 10 characters."
      );
      return;
    }

    const allComplaints =
      JSON.parse(localStorage.getItem("complaints")) || [];

    const newComplaint = {
      id: Date.now(),
      userId: user.id,
      studentName: user.name,
      title: title,
      description: description,
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    allComplaints.push(newComplaint);

    localStorage.setItem(
      "complaints",
      JSON.stringify(allComplaints)
    );

    setComplaints([
      ...complaints,
      newComplaint
    ]);

    setTitle("");
    setDescription("");

    setSuccess("Complaint submitted successfully.");
  };

  return (
    <div className="page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h2>Smart PG</h2>
          <p>Complaints</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>

      <main className="page-content">

        <h1>Complaints 🛠️</h1>

        <p className="page-description">
          Submit and track your complaints.
        </p>


        {/* Submit Complaint */}

        <div className="complaint-form-card">

          <h2>Submit a Complaint</h2>

          <form onSubmit={handleSubmit}>

            <label>Complaint Title</label>

            <input
              type="text"
              placeholder="Enter complaint title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <label>Description</label>

            <textarea
              placeholder="Describe your complaint..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows="5"
            />

            {error && (
              <p className="error">
                {error}
              </p>
            )}

            {success && (
              <p className="success">
                {success}
              </p>
            )}

            <button type="submit">
              Submit Complaint
            </button>

          </form>

        </div>


        {/* Previous Complaints */}

        <div className="complaints-list">

          <h2>My Complaints</h2>

          {complaints.length === 0 ? (

            <div className="empty-state">
              <p>
                You haven't submitted any complaints yet.
              </p>
            </div>

          ) : (

            complaints.map((complaint) => (

              <div
                className="complaint-card"
                key={complaint.id}
              >

                <div className="complaint-header">

                  <div>
                    <h3>
                      {complaint.title}
                    </h3>

                    <small>
                      Submitted on {complaint.date}
                    </small>
                  </div>

                  <span
                    className={`complaint-status ${complaint.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {complaint.status}
                  </span>

                </div>

                <p>
                  {complaint.description}
                </p>

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default Complaints;