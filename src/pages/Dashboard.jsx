import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  UserIcon,
  ShieldIcon,
  DashboardIcon,
  BedIcon,
  PaymentIcon,
  AttendanceIcon,
  ComplaintIcon,
  LeaveIcon,
  UsersIcon,
  BuildingIcon,
  AnalyticsIcon
} from "../components/Icons";

function Dashboard() {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  if (!user) {
    navigate("/login");
    return null;
  }

  const roleTitles = {
    ADMIN: { title: "System Administrator", badgeClass: "role-admin", desc: "Central administration and property oversight." },
    OWNER: { title: "Property Owner", badgeClass: "role-owner", desc: "Property, room, tenant, and revenue operations." },
    WARDEN: { title: "Hostel Warden", badgeClass: "role-warden", desc: "Attendance logging, leave requests, and discipline." },
    STUDENT: { title: "Student Resident", badgeClass: "role-student", desc: "Room details, dues, attendance, and grievances." }
  };

  const currentRole = roleTitles[user.role] || roleTitles.STUDENT;

  return (
    <Layout>
      {/* Page Header */}
      <div className="page-header-voyage">
        <div className="header-meta">
          <h2>
            Welcome, {user.name}
          </h2>
          <div className="header-subtitle">
            Logged in as <strong>{currentRole.title}</strong> on Smart PG Management System.
          </div>
        </div>

        <div className="header-actions">
          <span className={`user-role-pill ${currentRole.badgeClass}`} style={{ fontSize: "12px", padding: "6px 14px" }}>
            {currentRole.title}
          </span>
        </div>
      </div>

      {/* Account Overview Stats */}
      <div className="stat-grid">
        <div className="stat-card-deck">
          <div className="stat-info">
            <div className="stat-label">Full Name</div>
            <div className="stat-value" style={{ fontSize: "20px" }}>{user.name}</div>
            <div className="stat-subtext">Verified User</div>
          </div>
          <div className="stat-icon-crest navy">
            <UserIcon size={22} />
          </div>
        </div>

        <div className="stat-card-deck">
          <div className="stat-info">
            <div className="stat-label">Email Address</div>
            <div className="stat-value" style={{ fontSize: "16px", wordBreak: "break-all" }}>{user.email}</div>
            <div className="stat-subtext">Primary Contact</div>
          </div>
          <div className="stat-icon-crest gold">
            <span>✉️</span>
          </div>
        </div>

        <div className="stat-card-deck">
          <div className="stat-info">
            <div className="stat-label">Role Category</div>
            <div className="stat-value" style={{ fontSize: "18px" }}>{user.role}</div>
            <div className="stat-subtext">Role-Based Access</div>
          </div>
          <div className="stat-icon-crest emerald">
            <ShieldIcon size={22} />
          </div>
        </div>

        <div className="stat-card-deck">
          <div className="stat-info">
            <div className="stat-label">Account Status</div>
            <div className="stat-value" style={{ fontSize: "18px", color: "var(--emerald-600)" }}>Active</div>
            <div className="stat-subtext">Operational</div>
          </div>
          <div className="stat-icon-crest emerald">
            <span>✓</span>
          </div>
        </div>
      </div>

      {/* Role-Specific Quick Navigation Grid */}
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>
            <DashboardIcon size={20} />
            Quick Actions & Operations
          </h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Select an area to access management tools
          </span>
        </div>

        <div className="panel-card-body">
          <div className="dashboard-grid">
            {user.role === "STUDENT" && (
              <>
                <div className="dashboard-card clickable" onClick={() => navigate("/my-room")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <BedIcon size={22} />
                  </div>
                  <h3>My Room</h3>
                  <p>View your room assignment, capacity, and hostel information.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/my-rent")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <PaymentIcon size={22} />
                  </div>
                  <h3>Rent & Dues</h3>
                  <p>Check monthly rent status, outstanding dues, and receipt records.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/attendance")}>
                  <div className="stat-icon-crest emerald" style={{ marginBottom: "12px" }}>
                    <AttendanceIcon size={22} />
                  </div>
                  <h3>Attendance Record</h3>
                  <p>View daily attendance percentage and complete monthly roll-call logs.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/complaints")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <ComplaintIcon size={22} />
                  </div>
                  <h3>Complaints & Requests</h3>
                  <p>Submit maintenance or facility complaints to the warden and owner.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/leave-request")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <LeaveIcon size={22} />
                  </div>
                  <h3>Leave Requests</h3>
                  <p>Apply for temporary absence or night-out passes with date validation.</p>
                </div>
              </>
            )}

            {user.role === "ADMIN" && (
              <>
                <div className="dashboard-card clickable" onClick={() => navigate("/admin")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <AnalyticsIcon size={22} />
                  </div>
                  <h3>Admin Dashboard</h3>
                  <p>System-wide metrics across all users, PGs, rooms, and payments.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-users")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <UsersIcon size={22} />
                  </div>
                  <h3>Manage Users</h3>
                  <p>Create, update, or remove Owners, Wardens, and Students.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-pgs")}>
                  <div className="stat-icon-crest emerald" style={{ marginBottom: "12px" }}>
                    <BuildingIcon size={22} />
                  </div>
                  <h3>Manage PGs</h3>
                  <p>Register new PG properties and assign property owners.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/system-stats")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <AnalyticsIcon size={22} />
                  </div>
                  <h3>System Analytics</h3>
                  <p>Financial summaries, total capacity, occupancy, and complaint reports.</p>
                </div>
              </>
            )}

            {user.role === "OWNER" && (
              <>
                <div className="dashboard-card clickable" onClick={() => navigate("/owner")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <BuildingIcon size={22} />
                  </div>
                  <h3>Owner Dashboard</h3>
                  <p>Consolidated view of your properties, occupancy rates, and revenue.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-rooms")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <BedIcon size={22} />
                  </div>
                  <h3>Room Management</h3>
                  <p>Create rooms, configure bed capacity, and adjust monthly rent.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-students")}>
                  <div className="stat-icon-crest emerald" style={{ marginBottom: "12px" }}>
                    <UsersIcon size={22} />
                  </div>
                  <h3>Student Management</h3>
                  <p>Register students and allocate or vacate room assignments.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/payments-overview")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <PaymentIcon size={22} />
                  </div>
                  <h3>Payments Overview</h3>
                  <p>Record fee payments, track collections, and view receipt histories.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/complaints-overview")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <ComplaintIcon size={22} />
                  </div>
                  <h3>Complaints Overview</h3>
                  <p>Review and resolve facility and maintenance complaints.</p>
                </div>
              </>
            )}

            {user.role === "WARDEN" && (
              <>
                <div className="dashboard-card clickable" onClick={() => navigate("/warden")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <DashboardIcon size={22} />
                  </div>
                  <h3>Warden Dashboard</h3>
                  <p>Daily hostel summary, attendance status, and pending approvals.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-attendance")}>
                  <div className="stat-icon-crest emerald" style={{ marginBottom: "12px" }}>
                    <AttendanceIcon size={22} />
                  </div>
                  <h3>Attendance Management</h3>
                  <p>Mark daily attendance (Present or Absent) by date for all residents.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/manage-leaves")}>
                  <div className="stat-icon-crest gold" style={{ marginBottom: "12px" }}>
                    <LeaveIcon size={22} />
                  </div>
                  <h3>Leave Request Management</h3>
                  <p>Review, approve, or reject student leave applications.</p>
                </div>

                <div className="dashboard-card clickable" onClick={() => navigate("/view-students")}>
                  <div className="stat-icon-crest navy" style={{ marginBottom: "12px" }}>
                    <UsersIcon size={22} />
                  </div>
                  <h3>Student Directory</h3>
                  <p>Searchable resident roster with room and contact details.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;