import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Play,
  Plus,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useWorkouts } from "../../context/WorkoutContext";

export default function MobileNav() {
  const { activeWorkout } = useWorkouts();

  return (
    <nav className="mobile-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/workouts"
        end
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <Dumbbell size={20} />
        <span>Workouts</span>
      </NavLink>

      {activeWorkout ? (
        <NavLink
          to={`/workouts/${activeWorkout._id}`}
          className="mobile-start active-pulse"
          title="Resume Workout"
        >
          <Play size={22} fill="currentColor" />
        </NavLink>
      ) : (
        <NavLink
          to="/workouts"
          className="mobile-start"
          title="Start Workout"
        >
          <Plus size={24} />
        </NavLink>
      )}

      <NavLink
        to="/templates"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <ClipboardList size={20} />
        <span>Templates</span>
      </NavLink>

      <NavLink
        to="/exercises"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <Dumbbell size={20} />
        <span>Exercises</span>
      </NavLink>
    </nav>
  );
}