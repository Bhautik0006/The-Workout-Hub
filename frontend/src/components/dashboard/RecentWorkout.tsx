import { Dumbbell, ChevronRight, Clock, Calendar, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkouts } from "../../context/WorkoutContext";

export default function RecentWorkout() {
  const navigate = useNavigate();
  const { workouts } = useWorkouts();

  const completedWorkouts = workouts
    .filter((w) => w.status === "completed")
    .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())
    .slice(0, 4);

  return (
    <div className="recent-card">
      <div className="section-header">
        <div>
          <h2>Recent Workouts</h2>
          <p>Your latest training sessions</p>
        </div>

        <Link to="/workouts" className="view-all">
          View all workouts <ChevronRight size={14} />
        </Link>
      </div>

      <div className="workout-list">
        {completedWorkouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 12px", color: "#68726b", fontSize: "12px" }}>
            <Dumbbell size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <p>No completed workouts logged yet.</p>
            <Link to="/workouts" style={{ color: "#b6f23a", display: "inline-block", marginTop: "10px", fontWeight: 700 }}>
              Start your first session →
            </Link>
          </div>
        ) : (
          completedWorkouts.map((workout) => {
            const dateStr = workout.completedAt
              ? new Date(workout.completedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "Recently";

            const durationSec = workout.duration !== undefined
              ? workout.duration
              : workout.startedAt && workout.completedAt
              ? Math.max(0, Math.round((new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()) / 1000))
              : 0;

            const durationMinutes = Math.round(durationSec / 60);

            let setsCount = 0;
            let calculatedVolume = 0;
            workout.exercises.forEach((ex) => {
              (ex.sets || []).forEach((set) => {
                if (set.completed) {
                  setsCount++;
                  calculatedVolume += (Number(set.weight) || 0) * (Number(set.reps) || 0);
                }
              });
            });

            const vol = workout.volume !== undefined && workout.volume > 0 ? workout.volume : calculatedVolume;

            return (
              <div
                className="workout-row"
                key={workout._id}
                onClick={() => navigate("/workouts")}
                style={{ cursor: "pointer" }}
              >
                <div className="workout-icon">
                  <Dumbbell size={18} />
                </div>

                <div className="workout-info">
                  <h3>{workout.name}</h3>
                  <div className="workout-meta">
                    <span>
                      <Calendar size={12} /> {dateStr}
                    </span>
                    {durationMinutes > 0 && (
                      <span>
                        <Clock size={12} /> {durationMinutes} min
                      </span>
                    )}
                    <span>
                      <Dumbbell size={12} /> {workout.exercises.length} exercises ({setsCount} sets)
                    </span>
                    {vol > 0 && (
                      <span style={{ color: "#b6f23a", fontWeight: 600 }}>
                        <Flame size={12} /> {vol.toLocaleString()} kg Vol
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className="row-arrow" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}