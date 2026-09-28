import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  ChartNoAxesCombined,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Workouts",
    icon: Dumbbell,
  },
  {
    label: "Templates",
    icon: ClipboardList,
  },
  {
    label: "Progress",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Community",
    icon: Users,
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
            <button
              key={item.label}
              className={`nav-item ${
                item.label === "Dashboard" ? "active" : ""
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
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