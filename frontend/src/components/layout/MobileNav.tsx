import {
  ChartNoAxesCombined,
  Dumbbell,
  Home,
  Plus,
  User,
} from "lucide-react";

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <button className="mobile-nav-item active">
        <Home size={20} />
        <span>Home</span>
      </button>

      <button className="mobile-nav-item">
        <Dumbbell size={20} />
        <span>Workouts</span>
      </button>

      <button className="mobile-start">
        <Plus size={25} />
      </button>

      <button className="mobile-nav-item">
        <ChartNoAxesCombined size={20} />
        <span>Progress</span>
      </button>

      <button className="mobile-nav-item">
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
}