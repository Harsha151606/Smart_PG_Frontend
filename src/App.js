import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Attendance from "./pages/Attendance";
import MyRent from "./pages/MyRent";
import LeaveRequest from "./pages/LeaveRequest";
import Register from "./pages/Register";
import Complaints from "./pages/Complaints";
import Dashboard from "./pages/Dashboard";
import MyRoom from "./pages/MyRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/my-room"
          element={<MyRoom />}
        />
        <Route
          path="/my-rent"
          element={<MyRent />}
        />
        <Route
          path="/attendance"
          element={<Attendance />}
        />
        <Route
          path="/complaints"
          element={<Complaints />}
        />
        <Route 
          path="/leave-request" 
          element={<LeaveRequest />} 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;