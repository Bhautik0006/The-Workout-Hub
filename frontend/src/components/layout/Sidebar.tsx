import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWorkouts } from "../../context/WorkoutContext";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Workouts", icon: Dumbbell, path: "/workouts" },
  { label: "Templates", icon: ClipboardList, path: "/templates" },
  { label: "Exercises", icon: Dumbbell, path: "/exercises" },
  { label: "Community", icon: Users, path: "/community" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { cancelActiveWorkout } = useWorkouts();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await cancelActiveWorkout();
    } catch (err) {
      console.warn("Cancel active workout error:", err);
    }
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="logo">
        <div className="logo-mark">
          <Dumbbell size={21} />
        </div>
        <span>
          WORKOUT<span>HUB</span>
        </span>
      </Link>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
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
        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}