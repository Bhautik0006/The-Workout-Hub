import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search, Dumbbell, Trash2, Edit2, Play } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useExercises } from "../context/ExerciseContext";
import { useWorkouts } from "../context/WorkoutContext";
import type { Exercise } from "../types/exercise";
import "./ExercisesPage.css";

const MUSCLE_GROUPS = [
  "All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms", 
  "Core", "Quadriceps", "Hamstrings", "Glutes", "Calves", "Full Body", "Cardio", "Other"
];

const EQUIPMENT = [
  "All", "Barbell", "Dumbbell", "Machine", "Cable", "Resistance Band", "Kettlebell", "Bodyweight", "Other"
];

export default function ExercisesPage() {
  const { exercises, deleteExercise, addExercise, updateExercise } = useExercises();
  const { activeWorkout, syncLocalWorkout } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [filterEquipment, setFilterEquipment] = useState("All");
  const [filterType, setFilterType] = useState<"All" | "Custom" | "Standard">("All");
  const [addedNotice, setAddedNotice] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const navigate = useNavigate();

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = filterMuscle === "All" || ex.muscleGroup === filterMuscle;
    const matchesEq = filterEquipment === "All" || ex.equipment === filterEquipment;
    const matchesType = filterType === "All" || (filterType === "Custom" && ex.isCustom) || (filterType === "Standard" && !ex.isCustom);
    
    return matchesSearch && matchesMuscle && matchesEq && matchesType;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this custom exercise?")) {
      deleteExercise(id).catch(() => alert("Failed to delete exercise"));
    }
  };

  const handleEdit = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExercise(ex);
    setShowAddModal(true);
  };

  const handleAddToActiveWorkout = (ex: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeWorkout) return;

    const draftKey = `active_workout_draft_${activeWorkout._id}`;
    let draftExercises: any[] = [];
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.exercises)) {
          draftExercises = parsed.exercises;
        }
      } catch {}
    } else if (activeWorkout.exercises) {
      draftExercises = activeWorkout.exercises.map((item: any) => ({
        exerciseId: item.exercise?._id || item.exercise,
        exerciseName: item.exercise?.name || "Exercise",
        muscleGroup: item.exercise?.muscleGroup || "",
        equipment: item.exercise?.equipment || "",
        notes: item.notes || "",
        sets: item.sets || [{ weight: 0, reps: 10, restSeconds: 60, completed: false }],
      }));
    }

    const newEx = {
      exerciseId: ex.id || (ex as any)._id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      notes: "",
      sets: [
        { weight: 0, reps: 10, restSeconds: 60, completed: false },
        { weight: 0, reps: 10, restSeconds: 60, completed: false },
        { weight: 0, reps: 10, restSeconds: 60, completed: false },
      ],
    };

    const updatedList = [...draftExercises, newEx];
    const updatedDraft = {
      name: activeWorkout.name,
      notes: activeWorkout.notes || "",
      media: activeWorkout.media || [],
      exercises: updatedList,
    };

    localStorage.setItem(draftKey, JSON.stringify(updatedDraft));
    syncLocalWorkout(activeWorkout._id, {
      exercises: updatedList.map((item) => ({
        exercise: {
          _id: item.exerciseId,
          name: item.exerciseName,
          muscleGroup: item.muscleGroup,
          equipment: item.equipment,
        } as any,
        notes: item.notes,
        sets: item.sets,
      })),
    });

    setAddedNotice(`Added "${ex.name}" to your active workout!`);
    setTimeout(() => setAddedNotice(""), 2500);
  };

  const hasActiveFilters = searchTerm || filterMuscle !== "All" || filterEquipment !== "All" || filterType !== "All";
  const clearFilters = () => {
    setSearchTerm("");
    setFilterMuscle("All");
    setFilterEquipment("All");
    setFilterType("All");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard exercises-page">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR LIBRARY</p>
              <h1>
                Exercise <span>Library</span>
              </h1>
              <p className="welcome-text">Explore exercises, manage your library, and track your performance.</p>
              <p className="exercise-count">{exercises.length} total exercises</p>
            </div>
            <button className="start-workout-button" onClick={() => { setEditingExercise(null); setShowAddModal(true); }}>
              <Plus size={18} />
              Add Exercise
            </button>
          </section>

          {activeWorkout && (
            <div className="active-workout-banner">
              <div className="active-banner-info">
                <span className="active-pulse-dot" />
                <span>
                  Workout in Progress: <strong>{activeWorkout.name}</strong>
                  {addedNotice && (
                    <span style={{ marginLeft: "12px", color: "#b6f23a", fontWeight: 600 }}>
                      ✓ {addedNotice}
                    </span>
                  )}
                </span>
              </div>
              <Link to={`/workouts/${activeWorkout._id}`} className="active-banner-resume">
                <Play size={14} fill="currentColor" /> Return to Session
              </Link>
            </div>
          )}

          <section className="exercises-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <select className="filter-select" value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
                <option value="All">All Muscle Groups</option>
                {MUSCLE_GROUPS.filter(g => g !== "All").map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="filter-select" value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)}>
                <option value="All">All Equipment</option>
                {EQUIPMENT.filter(g => g !== "All").map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                <option value="All">All Types</option>
                <option value="Standard">Standard</option>
                <option value="Custom">Custom</option>
              </select>
              
              {hasActiveFilters && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </section>

          {filteredExercises.length === 0 ? (
            <div className="empty-state">
              <Dumbbell size={48} className="empty-icon" />
              <h3>No exercises found</h3>
              <p>Try adjusting your filters or create a new custom exercise.</p>
              {hasActiveFilters && <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>}
            </div>
          ) : (
            <div className="exercises-grid">
              {filteredExercises.map((ex) => (
                <div key={ex.id} className="exercise-card" onClick={() => navigate(`/exercises/${ex.id}`)}>
                  <div className="ex-card-top">
                    {ex.media && ex.media.length > 0 ? (
                      <div className="ex-image" style={{ backgroundImage: `url(${ex.media[0].url})` }} />
                    ) : (
                      <div className="ex-placeholder">
                        <Dumbbell size={24} />
                      </div>
                    )}
                    <div className="ex-badges">
                      {ex.isCustom && <span className="custom-badge">Custom</span>}
                    </div>
                  </div>
                  <div className="ex-card-content">
                    <h3>{ex.name}</h3>
                    <div className="ex-meta">
                      <span className="ex-muscle">{ex.muscleGroup}</span>
                      <span className="ex-equipment">{ex.equipment}</span>
                    </div>
                    <p className="ex-desc">{ex.description}</p>
                    
                    <div className="ex-actions">
                      <span className="view-link">View Progress →</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {activeWorkout && (
                          <button
                            type="button"
                            className="btn-add-to-workout"
                            onClick={(e) => handleAddToActiveWorkout(ex, e)}
                            title="Add to current workout"
                          >
                            <Plus size={13} /> Add to Workout
                          </button>
                        )}
                        {ex.isCustom && (
                          <div className="custom-actions">
                            <button onClick={(e) => handleEdit(ex, e)}><Edit2 size={14} /></button>
                            <button className="delete" onClick={(e) => handleDelete(ex.id, e)}><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddModal && (
            <ExerciseModal 
              exercise={editingExercise} 
              onClose={() => setShowAddModal(false)} 
              onSave={async (data) => {
                try {
                  if (editingExercise) {
                    await updateExercise(editingExercise.id, data);
                  } else {
                    await addExercise(data);
                  }
                  setShowAddModal(false);
                } catch (err: any) {
                  alert(err.message || "Failed to save exercise");
                }
              }}
            />
          )}

        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function ExerciseModal({ exercise, onClose, onSave }: { exercise: Exercise | null, onClose: () => void, onSave: (data: Partial<Exercise>) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    muscleGroup: exercise?.muscleGroup || "Chest",
    equipment: exercise?.equipment || "Barbell",
  });
  
  const [mediaFile, setMediaFile] = useState<{ url: string, type: "image" | "video" } | null>(
    exercise?.media?.[0] ? { url: exercise.media[0].url, type: exercise.media[0].type } : null
  );
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Max 2MB.");
      return;
    }
    setUploading(true);
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const type = file.type.startsWith("video/") ? "video" : "image";
      setMediaFile({ url: base64Url, type });
      setUploading(false);
    };
    reader.onerror = () => { setError("Failed to read file"); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError("Exercise name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ ...formData, media: mediaFile ? [mediaFile] : [] });
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{exercise ? "Edit Exercise" : "Add Custom Exercise"}</h2>
        {error && <div className="error-message" style={{ padding: '8px', marginBottom: '12px' }}>{error}</div>}
        
        <div className="form-group-modal">
          <label>Exercise Name *</label>
          <input className="standalone-input" value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); setError(""); }} />
        </div>
        
        <div className="form-group-row">
          <div className="form-group-modal half">
            <label>Muscle Group *</label>
            <select className="standalone-input" value={formData.muscleGroup} onChange={e => setFormData({...formData, muscleGroup: e.target.value})}>
              {MUSCLE_GROUPS.filter(g => g !== "All").map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group-modal half">
            <label>Equipment</label>
            <select className="standalone-input" value={formData.equipment} onChange={e => setFormData({...formData, equipment: e.target.value})}>
              {EQUIPMENT.filter(g => g !== "All").map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group-modal">
          <label>Upload Media (Image / Video max 2MB)</label>
          <div className="file-upload-wrapper">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange} 
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-secondary file-upload-label">
              {uploading ? "Processing..." : "Choose File"}
            </label>
            {mediaFile && (
              <span className="file-name">Media attached</span>
            )}
            {mediaFile && (
              <button 
                type="button" 
                className="btn-icon-delete" 
                onClick={() => setMediaFile(null)}
                style={{ marginLeft: 'auto' }}
              >
                Clear
              </button>
            )}
          </div>
          {mediaFile && mediaFile.type === "image" && (
            <div className="media-preview-small" style={{ backgroundImage: `url(${mediaFile.url})` }} />
          )}
          {mediaFile && mediaFile.type === "video" && (
            <video src={mediaFile.url} className="media-preview-small" controls />
          )}
        </div>

        <div className="form-group-modal">
          <label>Description</label>
          <textarea className="standalone-input textarea" style={{minHeight: '60px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="modal-actions" style={{marginTop: '20px'}}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || uploading}>{saving ? "Saving..." : "Save Exercise"}</button>
        </div>
      </div>
    </div>
  );
}
