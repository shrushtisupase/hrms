import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import MobileFrame from "./components/MobileFrame.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Attendance from "./pages/Attendance.jsx";
import Leaves from "./pages/Leaves.jsx";
import Profile from "./pages/Profile.jsx";
import AdminConsole from "./pages/AdminConsole.jsx";
import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";
import EmployeeProfileDetail from "./pages/EmployeeProfileDetail.jsx";

// routing layout for authenticated sessions
function ProtectedLayout() {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden relative">
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

// routing layout for admin/hr restricted console
function AdminLayout() {
  const { user } = useAuthStore();
  const isAdminOrHR = user?.role === "ADMIN" || user?.role === "HR";

  if (!isAdminOrHR) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { initTheme } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <MobileFrame>
        <Routes>
          {/* public auth route */}
          <Route path="/login" element={<Login />} />

          {/* session routes protected via layout */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/logs" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/profile" element={<Profile />} />

            {/* admin console route restriction */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminConsole />} />
              <Route path="/employees" element={<EmployeeDirectory />} />
              <Route path="/employees/:id" element={<EmployeeProfileDetail />} />
            </Route>
          </Route>

          {/* wildcard redirect fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileFrame>
    </BrowserRouter>
  );
}
