import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  Settings,
  CircleHelp,
  LogOut,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Sales Records",
    path: "/dashboard/sales",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    path: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/dashboard/reports",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help",
    path: "/dashboard/help",
    icon: CircleHelp,
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="brand">
  <img
    src={logo}
    
    className="brand-logo"
  />

  {!collapsed && (
    <div className="brand-text">
      
    </div>
  )}
</div>

      {/* Collapse Button */}
      <button
        type="button"
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen size={20} />
        ) : (
          <PanelLeftClose size={20} />
        )}
      </button>

      {!collapsed && (
        <p className="menu-heading">MAIN MENU</p>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={name === "Dashboard"}
            title={collapsed ? name : undefined}
            aria-label={name}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={21} strokeWidth={1.8} />

            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="help-card">
            <CircleHelp size={22} />
            <strong>Need help?</strong>
            <p>Our support team is here for you.</p>

            <button
              type="button"
              onClick={() => navigate("/dashboard/help")}
            >
              Get Support
            </button>
          </div>
        )}

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={21} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
