import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import MyRent from "./pages/MyRent";
import LeaveRequest from "./pages/LeaveRequest";
import Complaints from "./pages/Complaints";
import MyRoom from "./pages/MyRoom";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Universal Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/my-room"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rent"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <MyRent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <Complaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-request"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <LeaveRequest />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-pgs"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-stats"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-rooms"
          element={
            <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-students"
          element={
            <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments-overview"
          element={
            <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints-overview"
          element={
            <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Warden Routes */}
        <Route
          path="/warden"
          element={
            <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-attendance"
          element={
            <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-leaves"
          element={
            <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-students"
          element={
            <ProtectedRoute allowedRoles={["WARDEN", "ADMIN"]}>
              <WardenDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;