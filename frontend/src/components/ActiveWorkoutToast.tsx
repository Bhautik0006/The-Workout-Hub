import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, Dumbbell, ChevronRight } from "lucide-react";
import { useWorkouts } from "../context/WorkoutContext";
import "./ActiveWorkoutToast.css";

export default function ActiveWorkoutToast() {
  const { activeWorkout } = useWorkouts();
  const location = useLocation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeWorkout || activeWorkout.status !== "active") return;

    const start = new Date(activeWorkout.startedAt).getTime();
    setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout || activeWorkout.status !== "active") {
    return null;
  }

  // Format time (HH:MM:SS or MM:SS)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isCurrentPageActiveWorkout =
    location.pathname === `/workouts/${activeWorkout._id}`;

  const handleToastClick = (e: React.MouseEvent) => {
    if (isCurrentPageActiveWorkout) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  let completedSets = 0;
  let totalSets = 0;
  (activeWorkout.exercises || []).forEach((ex) => {
    (ex.sets || []).forEach((set) => {
      totalSets++;
      if (set.completed) completedSets++;
    });
  });

  return (
    <div
      className={`active-workout-toast ${
        isCurrentPageActiveWorkout ? "toast-compact" : ""
      }`}
    >
      <Link
        to={`/workouts/${activeWorkout._id}`}
        onClick={handleToastClick}
        className="toast-content"
      >
        <div className="toast-left">
          <div className="pulse-indicator-ring">
            <span className="pulse-indicator-dot"></span>
          </div>
          <div className="toast-info">
            <span className="toast-label">WORKOUT IN PROGRESS</span>
            <h4 className="toast-title">{activeWorkout.name || "Freestyle Workout"}</h4>
          </div>
        </div>

        <div className="toast-center">
          <div className="toast-timer">
            <Clock size={15} className="toast-timer-icon" />
            <span className="toast-time">{formatTime(elapsed)}</span>
          </div>
          {totalSets > 0 && (
            <div className="toast-sets-meta">
              <Dumbbell size={13} />
              <span>
                {completedSets}/{totalSets} sets
              </span>
            </div>
          )}
        </div>

        <div className="toast-right">
          <span className="toast-action-btn">
            {isCurrentPageActiveWorkout ? "In Progress" : "Resume"}
            <ChevronRight size={16} />
          </span>
        </div>
      </Link>
    </div>
  );
}
