import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  SmartPgLogo,
  DashboardIcon,
  UsersIcon,
  BuildingIcon,
  BedIcon,
  PaymentIcon,
  AttendanceIcon,
  LeaveIcon,
  ComplaintIcon,
  AnalyticsIcon,
  LogoutIcon
} from "./Icons";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  })();

  const role = localStorage.getItem("role") || user?.role || "";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "OWNER") return "/owner";
    if (role === "WARDEN") return "/warden";
    return "/dashboard";
  };

  const getRoleBadge = () => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrator", className: "role-admin" };
      case "OWNER":
        return { label: "Property Owner", className: "role-owner" };
      case "WARDEN":
        return { label: "Hostel Warden", className: "role-warden" };
      case "STUDENT":
        return { label: "Student Resident", className: "role-student" };
      default:
        return { label: "Guest", className: "role-student" };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="grand-navbar">
      <div className="navbar-container">
        {/* Clickable Brand Logo */}
        <Link to={getDashboardPath()} className="brand-link" title="Smart PG Dashboard">
          <div className="brand-crest">
            <SmartPgLogo size={28} />
          </div>
          <div className="brand-text">
            <h1>
              Smart <span className="gold">PG</span>
            </h1>
            <div className="brand-tagline">Management System</div>
          </div>
        </Link>

        {/* Role Navigation Links */}
        <nav className="navbar-nav">
          <Link
            to={getDashboardPath()}
            className={`nav-item ${
              location.pathname === getDashboardPath() || location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
          >
            <DashboardIcon size={16} />
            Dashboard
          </Link>

          {role === "ADMIN" && (
            <>
              <Link
                to="/manage-users"
                className={`nav-item ${location.pathname === "/manage-users" ? "active" : ""}`}
              >
                <UsersIcon size={16} />
                Users
              </Link>
              <Link
                to="/manage-pgs"
                className={`nav-item ${location.pathname === "/manage-pgs" ? "active" : ""}`}
              >
                <BuildingIcon size={16} />
                PG Properties
              </Link>
              <Link
                to="/system-stats"
                className={`nav-item ${location.pathname === "/system-stats" ? "active" : ""}`}
              >
                <AnalyticsIcon size={16} />
                Analytics
              </Link>
            </>
          )}

          {role === "OWNER" && (
            <>
              <Link
                to="/manage-rooms"
                className={`nav-item ${location.pathname === "/manage-rooms" ? "active" : ""}`}
              >
                <BedIcon size={16} />
                Rooms & Beds
              </Link>
              <Link
                to="/manage-students"
                className={`nav-item ${location.pathname === "/manage-students" ? "active" : ""}`}
              >
                <UsersIcon size={16} />
                Students
              </Link>
              <Link
                to="/payments-overview"
                className={`nav-item ${location.pathname === "/payments-overview" ? "active" : ""}`}
              >
                <PaymentIcon size={16} />
                Payments
              </Link>
              <Link
                to="/complaints-overview"
                className={`nav-item ${location.pathname === "/complaints-overview" ? "active" : ""}`}
              >
                <ComplaintIcon size={16} />
                Complaints
              </Link>
            </>
          )}

          {role === "WARDEN" && (
            <>
              <Link
                to="/manage-attendance"
                className={`nav-item ${location.pathname === "/manage-attendance" ? "active" : ""}`}
              >
                <AttendanceIcon size={16} />
                Attendance
              </Link>
              <Link
                to="/manage-leaves"
                className={`nav-item ${location.pathname === "/manage-leaves" ? "active" : ""}`}
              >
                <LeaveIcon size={16} />
                Leave Requests
              </Link>
              <Link
                to="/view-students"
                className={`nav-item ${location.pathname === "/view-students" ? "active" : ""}`}
              >
                <UsersIcon size={16} />
                Directory
              </Link>
              <Link
                to="/manage-complaints"
                className={`nav-item ${location.pathname === "/manage-complaints" ? "active" : ""}`}
              >
                <ComplaintIcon size={16} />
                Complaints
              </Link>
            </>
          )}

          {role === "STUDENT" && (
            <>
              <Link
                to="/my-room"
                className={`nav-item ${location.pathname === "/my-room" ? "active" : ""}`}
              >
                <BedIcon size={16} />
                My Room
              </Link>
              <Link
                to="/my-rent"
                className={`nav-item ${location.pathname === "/my-rent" ? "active" : ""}`}
              >
                <PaymentIcon size={16} />
                Rent & Dues
              </Link>
              <Link
                to="/attendance"
                className={`nav-item ${location.pathname === "/attendance" ? "active" : ""}`}
              >
                <AttendanceIcon size={16} />
                Attendance
              </Link>
              <Link
                to="/complaints"
                className={`nav-item ${location.pathname === "/complaints" ? "active" : ""}`}
              >
                <ComplaintIcon size={16} />
                Complaints
              </Link>
              <Link
                to="/leave-request"
                className={`nav-item ${location.pathname === "/leave-request" ? "active" : ""}`}
              >
                <LeaveIcon size={16} />
                Leaves
              </Link>
            </>
          )}
        </nav>

        {/* User Badge & Logout */}
        <div className="navbar-user-deck">
          <div className="user-badge">
            <span className={`user-role-pill ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
            <span className="user-name">
              {user?.name || "User"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-nav-logout"
            title="Sign out of system"
          >
            <LogoutIcon size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
