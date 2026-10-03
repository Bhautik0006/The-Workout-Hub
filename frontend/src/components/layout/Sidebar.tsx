import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Workouts",
    icon: Dumbbell,
    path: "/workouts",
  },
  {
    label: "Templates",
    icon: ClipboardList,
    path: "/templates",
  },
  {
    label: "Exercises",
    icon: Dumbbell,
    path: "/exercises",
  },
  {
    label: "Community",
    icon: Users,
    path: "/community",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">W</div>
        <span>WORKOUT HUB</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <p className="nav-title account-title">ACCOUNT</p>

        <button className="nav-item">
          <User size={19} />
          <span>Profile</span>
        </button>

        <button className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item logout">
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}