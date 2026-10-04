import { Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search workouts, exercises..."
        />
      </div>

      <div className="topbar-right">
        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile-mini">
          <div className="avatar">{initials}</div>

          <div className="profile-info">
            <span className="profile-name">{user?.name ?? "—"}</span>
            <span className="profile-role">Athlete</span>
          </div>
        </div>
      </div>
    </header>
  );
}