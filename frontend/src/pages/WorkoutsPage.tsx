import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Play, Calendar, Dumbbell, Clock } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useWorkouts } from "../context/WorkoutContext";
import type { Workout } from "../types/workout";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
  const { workouts, startWorkout } = useWorkouts();
  const navigate = useNavigate();

  const activeWorkout = workouts.find(w => w.status === "active");
  const completedWorkouts = workouts.filter(w => w.status === "completed");

  const handleStartBlankWorkout = () => {
    const newWorkout = startWorkout({ name: "Freestyle Workout" });
    navigate(`/workouts/${newWorkout._id}`);
  };

  const calculateVolume = (workout: Workout) => {
    let vol = 0;
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && set.weight && set.reps) {
          vol += set.weight * set.reps;
        }
      });
    });
    return vol;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard workouts-page">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">TRAINING HISTORY</p>
              <h1>
                Your <span>Workouts</span>
              </h1>
              <p className="welcome-text">Track your progress and start new sessions.</p>
            </div>
            
            {activeWorkout ? (
              <Link to={`/workouts/${activeWorkout._id}`} className="start-workout-button active-session-btn">
                <Play size={18} fill="currentColor" />
                Resume Active Workout
              </Link>
            ) : (
              <div className="start-actions">
                <Link to="/templates" className="btn-secondary">
                  Start from Template
                </Link>
                <button className="start-workout-button" onClick={handleStartBlankWorkout}>
                  <Plus size={18} />
                  Start Blank Workout
                </button>
              </div>
            )}
          </section>

          <section className="history-list">
            <h2>Completed Workouts</h2>
            {completedWorkouts.length === 0 ? (
              <div className="empty-state">
                <Dumbbell size={48} className="empty-icon" />
                <h3>No workouts completed yet</h3>
                <p>Start a new workout to begin tracking your progress.</p>
              </div>
            ) : (
              <div className="workouts-grid">
                {completedWorkouts.map(workout => (
                  <div key={workout._id} className="workout-history-card">
                    <div className="workout-card-header">
                      <h3>{workout.name}</h3>
                      <span className="date-badge">
                        <Calendar size={12} />
                        {new Date(workout.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="workout-stats">
                      <div className="stat-pill">
                        <Dumbbell size={14} />
                        {workout.exercises.length} Exercises
                      </div>
                      <div className="stat-pill">
                        <Clock size={14} />
                        {workout.completedAt ? 
                          Math.round((new Date(workout.completedAt).getTime() - new Date(workout.startedAt).getTime()) / 60000) 
                          : 0} min
                      </div>
                      <div className="stat-pill">
                        <span className="vol-icon">V</span>
                        {calculateVolume(workout).toLocaleString()} lbs Vol
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
