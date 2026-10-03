import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useWorkouts } from "../context/WorkoutContext";
import "./WorkoutsPage.css";

export default function ActiveWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkout, updateWorkout, completeWorkout, deleteWorkout } = useWorkouts();
  
  const workout = id ? getWorkout(id) : null;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!workout && id) {
      navigate("/workouts");
    }
  }, [workout, id, navigate]);

  useEffect(() => {
    if (workout && workout.status === "active") {
      const start = new Date(workout.startedAt).getTime();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [workout]);

  const handleFinish = () => {
    if (!workout) return;
    completeWorkout(workout._id);
    navigate("/workouts");
  };

  const handleDiscard = () => {
    if (!workout) return;
    if (window.confirm("Are you sure you want to discard this active workout?")) {
      deleteWorkout(workout._id);
      navigate("/workouts");
    }
  };

  const handleUpdateName = (name: string) => {
    if (!workout) return;
    updateWorkout(workout._id, { name });
  };

  const calculateVolume = () => {
    let vol = 0;
    if (workout) {
      workout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            vol += set.weight * set.reps;
          }
        });
      });
    }
    return vol;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!workout) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard active-workout-page">
          <div className="workout-header-sticky">
            <input 
              className="workout-title-input" 
              value={workout.name} 
              onChange={e => handleUpdateName(e.target.value)} 
            />
            <div className="workout-live-stats">
              <span className="timer">{formatTime(elapsed)}</span>
              <span className="vol">Vol: {calculateVolume().toLocaleString()} lbs</span>
            </div>
            <div className="header-actions">
              <button className="btn-danger-outline" onClick={handleDiscard}>Discard</button>
              <button className="btn-primary" onClick={handleFinish}><Check size={16} /> Finish</button>
            </div>
          </div>

          <div className="workout-exercises">
            {workout.exercises.length === 0 ? (
              <div className="empty-state">
                <p>No exercises added yet. (Functionality to add exercises to be implemented)</p>
              </div>
            ) : (
              workout.exercises.map((ex, exIndex) => (
                <div key={ex._id || exIndex} className="active-exercise-card">
                  <h3>{typeof ex.exercise === 'object' ? ex.exercise.name : 'Unknown Exercise'}</h3>
                  
                  <div className="sets-container">
                    <div className="set-header-row">
                      <span className="set-num">Set</span>
                      <span className="set-val">Lbs</span>
                      <span className="set-val">Reps</span>
                      <span className="set-check">Done</span>
                    </div>
                    
                    {ex.sets.map((set, setIndex) => (
                      <div key={set._id || setIndex} className={`set-row ${set.completed ? 'completed' : ''}`}>
                        <span className="set-num">{setIndex + 1}</span>
                        <input className="set-input" type="number" value={set.weight || ''} onChange={e => updateSet(workout._id, set._id!, { weight: Number(e.target.value) })} />
                        <input className="set-input" type="number" value={set.reps || ''} onChange={e => updateSet(workout._id, set._id!, { reps: Number(e.target.value) })} />
                        <button className="check-btn" onClick={() => updateSet(workout._id, set._id!, { completed: !set.completed })}>
                          <Check size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
