import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./page/Dashboard";
import Customers from "./page/Customers";

import "./index.css";
import "./style.css";


function Placeholder({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>Welcome to the {title} page.</p>
    </div>
  );
}

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {mobileOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`sidebar-container ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      <main
        className={`main-area ${
          collapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Navbar setMobileOpen={setMobileOpen} />

        <div className="page-content">
          <Routes>
            <Route index element={<Dashboard />} />

            <Route
              path="sales"
              element={<Placeholder title="Sales Records" />}
            />

            <Route
              path="customers"
              element={<Customers/>}
            />

            <Route
              path="reports"
              element={<Placeholder title="Reports" />}
            />

            <Route
              path="settings"
              element={<Placeholder title="Settings" />}
            />

            <Route
              path="help"
              element={<Placeholder title="Help & Support" />}
            />

            <Route
              path="profile"
              element={<Placeholder title="My Profile" />}
            />

            <Route
              path="search"
              element={<Placeholder title="Search Results" />}
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Register />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/dashboard/*"
          element={<DashboardLayout />}
        />

        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
