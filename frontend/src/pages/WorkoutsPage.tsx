import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  Calendar,
  Dumbbell,
  Clock,
  Layers,
  X,
  Search,
  Trash2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useWorkouts } from "../context/WorkoutContext";
import { useTemplates } from "../context/TemplateContext";
import type { Workout } from "../types/workout";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
  const { workouts, startWorkout, deleteWorkout, activeWorkout } = useWorkouts();
  const { templates } = useTemplates();
  const navigate = useNavigate();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [starting, setStarting] = useState(false);

  // All completed workouts sorted from most recent all the way to the first
  const completedWorkouts = workouts
    .filter((w) => w.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

  const handleStartBlankWorkout = async () => {
    setStarting(true);
    try {
      const newWorkout = await startWorkout({ name: "Freestyle Workout" });
      navigate(`/workouts/${newWorkout._id}`);
    } catch (err: any) {
      alert(err.message || "Failed to start workout");
    } finally {
      setStarting(false);
    }
  };

  const handleStartFromTemplate = async (templateId: string, templateName: string) => {
    setStarting(true);
    try {
      const newWorkout = await startWorkout({
        template: templateId,
        name: templateName,
      });
      setShowTemplateModal(false);
      navigate(`/workouts/${newWorkout._id}`);
    } catch (err: any) {
      alert(err.message || "Failed to start workout from template");
    } finally {
      setStarting(false);
    }
  };

  const handleDeleteWorkout = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this workout record?")) {
      try {
        await deleteWorkout(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete workout");
      }
    }
  };

  const calculateVolume = (workout: Workout) => {
    if (workout.volume && workout.volume > 0) return workout.volume;
    let vol = 0;
    (workout.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((set) => {
        if (set.completed && set.weight && set.reps) {
          vol += Number(set.weight) * Number(set.reps);
        }
      });
    });
    return vol;
  };

  const formatDuration = (workout: Workout) => {
    if (workout.duration && workout.duration > 0) {
      const m = Math.floor(workout.duration / 60);
      if (m >= 60) {
        const h = Math.floor(m / 60);
        const remM = m % 60;
        return `${h}h ${remM}m`;
      }
      return `${m || 1} min`;
    }
    if (workout.completedAt && workout.startedAt) {
      const diffMs =
        new Date(workout.completedAt).getTime() -
        new Date(workout.startedAt).getTime();
      const mins = Math.max(1, Math.round(diffMs / 60000));
      return `${mins} min`;
    }
    return "—";
  };

  const filteredTemplates = templates.filter((t) => {
    const q = templateSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard workouts-page">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">TRAINING SESSIONS</p>
              <h1>
                Your <span>Workouts</span>
              </h1>
              <p className="welcome-text">
                Track your progress, view workout history, or start a new training session.
              </p>
            </div>

            {activeWorkout ? (
              <div className="start-actions">
                <Link
                  to={`/workouts/${activeWorkout._id}`}
                  className="start-workout-button active-session-btn"
                >
                  <Play size={18} fill="currentColor" />
                  Resume Active: {activeWorkout.name}
                </Link>
              </div>
            ) : (
              <div className="start-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTemplateModal(true)}
                  disabled={starting}
                >
                  <Layers size={16} /> Start from Template
                </button>
                <button
                  type="button"
                  className="start-workout-button"
                  onClick={handleStartBlankWorkout}
                  disabled={starting}
                >
                  <Plus size={18} /> Start Empty Workout
                </button>
              </div>
            )}
          </section>

          <section className="history-list">
            <div className="section-header">
              <h2>Completed Workouts ({completedWorkouts.length})</h2>
            </div>

            {completedWorkouts.length === 0 ? (
              <div className="empty-state">
                <Dumbbell size={48} className="empty-icon" />
                <h3>No workouts completed yet</h3>
                <p>
                  Start an empty workout or select a template above to begin your first session.
                </p>
                <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="start-workout-button"
                    onClick={handleStartBlankWorkout}
                  >
                    <Plus size={16} /> Start First Workout
                  </button>
                </div>
              </div>
            ) : (
              <div className="workouts-grid">
                {completedWorkouts.map((workout) => {
                  const vol = calculateVolume(workout);
                  const durationStr = formatDuration(workout);
                  const exerciseCount = workout.exercises?.length ?? 0;
                  const setsCount = (workout.exercises || []).reduce(
                    (acc, ex) => acc + (ex.sets?.length ?? 0),
                    0
                  );

                  return (
                    <div key={workout._id} className="workout-history-card">
                      <div className="workout-card-header">
                        <div>
                          <h3>{workout.name}</h3>
                          <span className="date-badge">
                            <Calendar size={12} />
                            {new Date(workout.startedAt).toLocaleDateString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-ghost"
                          title="Delete workout"
                          onClick={(e) => handleDeleteWorkout(e, workout._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="workout-stats">
                        <div className="stat-pill">
                          <Dumbbell size={14} />
                          {exerciseCount} Exercises ({setsCount} sets)
                        </div>
                        <div className="stat-pill stat-pill-subtle">
                          <Clock size={14} />
                          {durationStr}
                        </div>
                        {vol > 0 && (
                          <div className="stat-pill">
                            <span className="vol-icon">V</span>
                            {vol.toLocaleString()} kg Vol
                          </div>
                        )}
                      </div>

                      {workout.notes && (
                        <p className="workout-history-notes">
                          {workout.notes}
                        </p>
                      )}

                      {workout.media && workout.media.length > 0 && (
                        <div className="workout-history-media">
                          {workout.media.map((m, idx) => (
                            <img
                              key={idx}
                              src={m.url}
                              alt="Workout attachment"
                              className="media-thumbnail-preview"
                            />
                          ))}
                        </div>
                      )}

                      <div className="workout-history-actions">
                        <Link
                          to={`/workouts/${workout._id}`}
                          className="link-btn"
                        >
                          View Details &amp; Summary
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Template Picker Modal */}
          {showTemplateModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowTemplateModal(false)}
            >
              <div
                className="modal-content template-picker-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div className="modal-header-title">
                    <Sparkles size={20} className="modal-icon" />
                    <h2>Select Workout Template</h2>
                  </div>
                  <button
                    type="button"
                    className="btn-icon-close"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="picker-search-bar">
                  <Search size={18} className="picker-search-icon" />
                  <input
                    type="text"
                    className="picker-search-input"
                    placeholder="Search templates by name or category..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    autoFocus
                  />
                  {templateSearch && (
                    <button
                      type="button"
                      className="picker-clear-search"
                      onClick={() => setTemplateSearch("")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="template-picker-list">
                  {templates.length === 0 ? (
                    <div className="picker-empty-state">
                      <p>You haven't created any templates yet.</p>
                      <Link to="/templates/new" className="btn-primary-sm">
                        Create Your First Template
                      </Link>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="picker-empty-state">
                      <p>No templates found matching "{templateSearch}".</p>
                    </div>
                  ) : (
                    filteredTemplates.map((t) => {
                      const exCount = t.exercises?.length ?? 0;
                      return (
                        <div
                          key={t._id}
                          className="template-picker-item"
                          onClick={() => handleStartFromTemplate(t._id, t.name)}
                        >
                          <div>
                            <div className="template-picker-name">{t.name}</div>
                            <div className="template-picker-meta">
                              <span>{t.category || "Full Body"}</span>
                              <span>•</span>
                              <span>{exCount} exercises</span>
                            </div>
                          </div>
                          <span className="template-picker-start">
                            Start Workout →
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
