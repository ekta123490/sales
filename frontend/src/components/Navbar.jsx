import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

export default function Navbar({ setMobileOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={23} />
      </button>

      <div className="search-box">
        <Search size={19} />
        <input
          type="search"
          placeholder="Search anything..."
          aria-label="Search dashboard"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              navigate(
                `/search?q=${encodeURIComponent(e.target.value.trim())}`
              );
            }
          }}
        />
        <kbd>⌘ K</kbd>
      </div>

      <div className="topbar-actions">
        <div className="dropdown-wrapper">
          <button
            className="icon-btn notification-btn"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={21} />
            <span className="notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="dropdown notification-dropdown">
              <h3>Notifications</h3>
              <div className="notification-item">
                <span className="notification-icon">
                  <ShoppingCartIcon />
                </span>
                <div>
                  <strong>New sale recorded</strong>
                  <p>A new order has been received.</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon">
                  <UserRound size={18} />
                </span>
                <div>
                  <strong>New customer</strong>
                  <p>A customer joined your business.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-wrapper">
          <button
            className="profile-trigger"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <div className="avatar">
              <UserRound size={21} />
            </div>
            <div className="profile-info">
              <strong>Admin User</strong>
              <span>Administrator</span>
            </div>
            <ChevronDown size={17} />
          </button>

          {profileOpen && (
            <div className="dropdown profile-dropdown">
              <button onClick={() => navigate("/profile")}>
                <UserRound size={18} /> My Profile
              </button>
              <button onClick={() => navigate("/settings")}>
                <Settings size={18} /> Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ShoppingCartIcon() {
  return <Search size={18} />;
}
