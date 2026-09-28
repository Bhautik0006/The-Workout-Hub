import { Bell, Search } from "lucide-react";

export default function Topbar() {
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
          <div className="avatar">B</div>

          <div className="profile-info">
            <span className="profile-name">Bhautik</span>
            <span className="profile-role">Athlete</span>
          </div>
        </div>
      </div>
    </header>
  );
}