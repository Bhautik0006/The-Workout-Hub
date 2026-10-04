import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Dumbbell,
  Trash2,
  Plus,
  Image as ImageIcon,
  X,
  Upload,
  Calendar,
  Save,
  ClipboardList,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import ExercisePickerModal from "../components/ExercisePickerModal";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../context/WorkoutContext";
import { useExercises } from "../context/ExerciseContext";
import { useAchievements } from "../context/AchievementContext";
import { workoutApi } from "../api/workoutApi";
import { achievementApi } from "../api/achievementApi";
import type { Workout, WorkoutExercise, WorkoutSet, WorkoutMedia } from "../types/workout";
import "./WorkoutsPage.css";

interface EditableSet {
  _id?: string;
  weight: number | string;
  reps: number | string;
  restSeconds: number | string;
  completed: boolean;
  notes?: string;
  isPR?: boolean;
}

interface EditableExercise {
  _id?: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  equipment?: string;
  notes: string;
  sets: EditableSet[];
}

export default function ActiveWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getWorkout,
    completeWorkout,
    deleteWorkout,
    updateWorkout,
    syncLocalWorkout,
    loading,
  } = useWorkouts();
  const { isAuthenticated } = useAuth();
  const { exercises: allDbExercises } = useExercises();
  const { celebratePR, showPRToast } = useAchievements();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [media, setMedia] = useState<WorkoutMedia[]>([]);
  const [localExercises, setLocalExercises] = useState<EditableExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [showMediaUrlModal, setShowMediaUrlModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedIdRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<any>(null);
  const isTerminatedRef = useRef(false);

  // If user logs out or session terminates, stop auto-saving
  useEffect(() => {
    if (!isAuthenticated) {
      isTerminatedRef.current = true;
    }
  }, [isAuthenticated]);

  // Helper: map server workout into editable state
  const mapServerExercises = useCallback((w: Workout): EditableExercise[] => {
    return (w.exercises || []).map((ex: WorkoutExercise) => {
      const exObj = typeof ex.exercise === "object" ? ex.exercise : null;
      const exId = typeof ex.exercise === "string" ? ex.exercise : exObj?._id || "";
      const dbEx = allDbExercises.find((e) => e.id === exId || (e as any)._id === exId);
      const exName = exObj?.name || dbEx?.name || "Exercise";
      const muscle =
        exObj?.muscleGroup ||
        (exObj as any)?.targetMuscleGroup ||
        dbEx?.muscleGroup ||
        "";
      const equipment = exObj?.equipment || dbEx?.equipment || "";

      const mappedSets: EditableSet[] = (ex.sets || []).map((s: WorkoutSet) => ({
        _id: s._id,
        weight: s.weight ?? 0,
        reps: s.reps ?? 10,
        restSeconds: s.restSeconds ?? 60,
        completed: Boolean(s.completed),
        notes: s.notes || "",
      }));

      return {
        _id: ex._id,
        exerciseId: exId,
        exerciseName: exName,
        muscleGroup: muscle,
        equipment,
        notes: ex.notes || "",
        sets:
          mappedSets.length > 0
            ? mappedSets
            : [
                {
                  weight: 0,
                  reps: 10,
                  restSeconds: 60,
                  completed: false,
                },
              ],
      };
    });
  }, [allDbExercises]);

  const initWorkoutState = useCallback((w: Workout) => {
    setWorkout(w);

    // Check if there is an existing unsaved local draft for this workout
    const draftKey = `active_workout_draft_${w._id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft && w.status === "active") {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          setWorkoutName(parsed.name ?? w.name ?? "Freestyle Workout");
          setWorkoutNotes(parsed.notes ?? w.notes ?? "");
          setMedia(parsed.media ?? w.media ?? []);
          if (Array.isArray(parsed.exercises)) {
            setLocalExercises(parsed.exercises);
            return;
          }
        }
      } catch (err) {
        // ignore parse error and fallback to server state
      }
    }

    setWorkoutName(w.name || "Freestyle Workout");
    setWorkoutNotes(w.notes || "");
    setMedia(w.media || []);
    setLocalExercises(mapServerExercises(w));
  }, [mapServerExercises]);

  // Load workout from context or API ONLY once per ID
  useEffect(() => {
    if (!id) return;
    if (initializedIdRef.current === id) return; // Prevent erasing data on re-render / route link clicks

    const found = getWorkout(id);
    if (found) {
      initializedIdRef.current = id;
      initWorkoutState(found);
    } else if (!loading) {
      workoutApi
        .getWorkout(id)
        .then((data) => {
          initializedIdRef.current = id;
          initWorkoutState(data);
        })
        .catch(() => {
          navigate("/workouts");
        });
    }
  }, [id, loading, getWorkout, initWorkoutState, navigate]);

  const isActive = workout?.status === "active";

  // Live timer for active workout
  useEffect(() => {
    if (!workout || workout.status !== "active") return;

    const start = new Date(workout.startedAt).getTime();
    setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [workout]);

  const calculateLiveVolume = useCallback(() => {
    let vol = 0;
    localExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          const w =
            typeof set.weight === "string" ? parseFloat(set.weight) || 0 : set.weight;
          const r =
            typeof set.reps === "string" ? parseInt(set.reps, 10) || 0 : set.reps;
          vol += w * r;
        }
      });
    });
    return vol;
  }, [localExercises]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Build clean payload for saving or completing
  const buildPayload = useCallback(() => {
    const formattedExercises = localExercises.map((ex) => {
      const cleanSets = ex.sets.map((s) => ({
        _id: s._id && String(s._id).length === 24 ? s._id : undefined,
        weight: s.weight === "" || isNaN(Number(s.weight)) ? 0 : Number(s.weight),
        reps: s.reps === "" || isNaN(Number(s.reps)) ? 0 : Number(s.reps),
        restSeconds:
          s.restSeconds === "" || isNaN(Number(s.restSeconds))
            ? 0
            : Number(s.restSeconds),
        completed: Boolean(s.completed),
        notes: s.notes?.trim() || undefined,
      }));

      return {
        _id: ex._id && String(ex._id).length === 24 ? ex._id : undefined,
        exercise: ex.exerciseId,
        notes: ex.notes?.trim() || undefined,
        sets: cleanSets,
      };
    });

    const vol = calculateLiveVolume();

    return {
      name: workoutName.trim() || "Freestyle Workout",
      notes: workoutNotes,
      media,
      volume: vol,
      exercises: formattedExercises,
    };
  }, [localExercises, calculateLiveVolume, workoutName, workoutNotes, media]);

  // Synchronize state to WorkoutContext & localStorage, and debounce auto-save to backend
  useEffect(() => {
    if (!id || initializedIdRef.current !== id || !isActive) return;

    const payload = buildPayload();
    const draftKey = `active_workout_draft_${id}`;

    // 1. Debounced local draft saving and context sync (200ms)
    const localTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            name: workoutName,
            notes: workoutNotes,
            media,
            exercises: localExercises,
          })
        );

        syncLocalWorkout(id, {
          name: workoutName.trim() || "Freestyle Workout",
          notes: workoutNotes,
          media,
          volume: payload.volume,
          exercises: localExercises.map((ex) => ({
            _id: ex._id,
            exercise: {
              _id: ex.exerciseId,
              name: ex.exerciseName,
              muscleGroup: ex.muscleGroup,
              equipment: ex.equipment,
            } as any,
            notes: ex.notes,
            sets: ex.sets.map((s) => ({
              _id: s._id,
              weight: Number(s.weight) || 0,
              reps: Number(s.reps) || 0,
              restSeconds: Number(s.restSeconds) || 0,
              completed: Boolean(s.completed),
              notes: s.notes,
            })),
          })),
        });
      } catch (e) {
        console.error("Local draft save error:", e);
      }
    }, 200);

    // 2. Debounced background auto-save to backend (1000ms)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatusText("Saving...");
        await workoutApi.updateWorkout(id, payload);
        setSaveStatusText("Saved");
        setTimeout(() => setSaveStatusText(""), 2000);
      } catch (err: any) {
        console.error("Auto-save error:", err);
        setSaveStatusText("");
      }
    }, 1000);

    return () => {
      clearTimeout(localTimer);
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        // Only flush pending save if workout was not finished/discarded/logged out
        if (!isTerminatedRef.current && localStorage.getItem("token")) {
          try {
            localStorage.setItem(
              draftKey,
              JSON.stringify({
                name: workoutName,
                notes: workoutNotes,
                media,
                exercises: localExercises,
              })
            );
          } catch {}
          workoutApi.updateWorkout(id, payload).catch((err) => {
            console.error("Save on unmount error:", err);
          });
        }
      }
    };
  }, [
    workoutName,
    workoutNotes,
    media,
    localExercises,
    id,
    isActive,
    buildPayload,
    syncLocalWorkout,
  ]);

  const handleFinish = async () => {
    if (!workout) return;
    isTerminatedRef.current = true;
    setSaving(true);
    try {
      const payload = buildPayload();
      const updated: any = await completeWorkout(workout._id, {
        ...payload,
        duration: elapsed,
        completedAt: new Date().toISOString(),
      });
      localStorage.removeItem(`active_workout_draft_${workout._id}`);
      setWorkout(updated);

      if (updated?.achievements && updated.achievements.length > 0) {
        celebratePR(updated.achievements);
      }
      navigate("/workouts");
    } catch (err: any) {
      alert(err.message || "Failed to complete workout");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!workout) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      const updated = await updateWorkout(workout._id, payload);
      setWorkout(updated);
      localStorage.setItem(
        `active_workout_draft_${workout._id}`,
        JSON.stringify({
          name: workoutName,
          notes: workoutNotes,
          media,
          exercises: localExercises,
        })
      );
      setSaveStatusText("Saved!");
      setTimeout(() => setSaveStatusText(""), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (!workout) return;
    if (
      window.confirm(
        "Are you sure you want to discard this workout? All progress from this session will be permanently deleted."
      )
    ) {
      isTerminatedRef.current = true;
      try {
        localStorage.removeItem(`active_workout_draft_${workout._id}`);
        await deleteWorkout(workout._id);
        navigate("/workouts");
      } catch (err: any) {
        alert(err.message || "Failed to discard workout");
      }
    }
  };

  // Add an exercise from modal
  const handleAddExercise = (exerciseId: string) => {
    const found = allDbExercises.find(
      (e) => e.id === exerciseId || (e as any)._id === exerciseId
    );
    if (!found) return;

    setLocalExercises((prev) => [
      ...prev,
      {
        exerciseId: found.id || (found as any)._id,
        exerciseName: found.name,
        muscleGroup: found.muscleGroup,
        equipment: found.equipment,
        notes: "",
        sets: [
          { weight: 0, reps: 10, restSeconds: 60, completed: false },
          { weight: 0, reps: 10, restSeconds: 60, completed: false },
          { weight: 0, reps: 10, restSeconds: 60, completed: false },
        ],
      },
    ]);
  };

  const handleRemoveExercise = (exIndex: number) => {
    setLocalExercises((prev) => prev.filter((_, i) => i !== exIndex));
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === localExercises.length - 1) return;
    const copy = [...localExercises];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [copy[index], copy[swapIdx]] = [copy[swapIdx], copy[index]];
    setLocalExercises(copy);
  };

  // Sets manipulation
  const handleUpdateSetField = (
    exIndex: number,
    setIndex: number,
    field: keyof EditableSet,
    val: any
  ) => {
    const updated = [...localExercises];
    const targetSet = { ...updated[exIndex].sets[setIndex], [field]: val };
    if (field === "weight" || field === "reps") {
      targetSet.isPR = false;
    }
    updated[exIndex].sets[setIndex] = targetSet;
    setLocalExercises(updated);
  };

  const handleToggleSetCompleted = async (exIndex: number, setIndex: number) => {
    const updated = [...localExercises];
    const currentCompleted = updated[exIndex].sets[setIndex].completed;
    const nextCompleted = !currentCompleted;
    updated[exIndex].sets[setIndex] = {
      ...updated[exIndex].sets[setIndex],
      completed: nextCompleted,
      isPR: nextCompleted ? updated[exIndex].sets[setIndex].isPR : false,
    };
    setLocalExercises(updated);

    // If set was just marked completed, check if it sets a new PR
    if (nextCompleted) {
      const targetSet = updated[exIndex].sets[setIndex];
      const w = Number(targetSet.weight) || 0;
      const r = Number(targetSet.reps) || 0;
      const exId = updated[exIndex].exerciseId;
      if (w > 0 && r > 0 && exId) {
        try {
          const prCheck = await achievementApi.checkPotentialPR({
            exerciseId: exId,
            weight: w,
            reps: r,
          });
          if (prCheck.isPR) {
            setLocalExercises((prev) => {
              const copy = [...prev];
              if (copy[exIndex]?.sets[setIndex]) {
                copy[exIndex].sets[setIndex].isPR = true;
              }
              return copy;
            });
            const text = prCheck.is1RMPR
              ? `Estimated 1RM: ${prCheck.current1RM} kg${prCheck.improvement1RM > 0 ? ` (+${prCheck.improvement1RM} kg)` : ""}`
              : `Heaviest lift: ${w} kg${prCheck.improvementWeight > 0 ? ` (+${prCheck.improvementWeight} kg)` : ""}`;
            showPRToast(`🔥 New PR on ${updated[exIndex].exerciseName}!`, text);
          }
        } catch {
          // Non-blocking
        }
      }
    }
  };

  const handleAddSet = (exIndex: number) => {
    const updated = [...localExercises];
    const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    updated[exIndex].sets.push({
      weight: lastSet ? lastSet.weight : 0,
      reps: lastSet ? lastSet.reps : 10,
      restSeconds: lastSet ? lastSet.restSeconds : 60,
      completed: false,
    });
    setLocalExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...localExercises];
    if (updated[exIndex].sets.length <= 1) return;
    updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
    setLocalExercises(updated);
  };

  // Media upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const isVideo = file.type.startsWith("video");
          setMedia((prev) => [
            ...prev,
            { type: isVideo ? "video" : "image", url: reader.result as string },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;
    const isVideo =
      mediaUrlInput.includes("youtube.com") ||
      mediaUrlInput.includes("vimeo.com") ||
      mediaUrlInput.endsWith(".mp4");
    setMedia((prev) => [
      ...prev,
      { type: isVideo ? "video" : "image", url: mediaUrlInput.trim() },
    ]);
    setMediaUrlInput("");
    setShowMediaUrlModal(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  if (!workout) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Topbar />
          <main className="dashboard loading-spinner-container">
            <div className="spinner"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard active-workout-page">
          {/* Sticky Header */}
          <div className="workout-header-sticky">
            <div className="workout-header-left">
              <div className="workout-nav-breadcrumbs">
                <Link to="/workouts" className="back-link">
                  <ArrowLeft size={15} /> Workouts
                </Link>
                <span className="breadcrumb-separator">•</span>
                <Link to="/templates" className="nav-shortcut-link" title="Browse your routines">
                  <ClipboardList size={14} /> Templates
                </Link>
                <span className="breadcrumb-separator">•</span>
                <Link to="/exercises" className="nav-shortcut-link" title="Browse exercise library">
                  <Dumbbell size={14} /> Exercises
                </Link>
              </div>
              {isActive ? (
                <input
                  className="workout-title-input"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Workout Name"
                />
              ) : (
                <h1 style={{ fontSize: "24px", margin: "4px 0" }}>{workout.name}</h1>
              )}
            </div>

            <div className="workout-live-stats">
              <div className="timer-pill" title="Elapsed Time">
                <Clock size={16} />
                <span>{isActive ? formatTime(elapsed) : formatTime(workout.duration || 0)}</span>
              </div>
              <div className="vol-pill" title="Total Volume">
                <span className="vol-icon">V</span>
                <span>
                  {isActive
                    ? calculateLiveVolume().toLocaleString()
                    : (workout.volume || 0).toLocaleString()}{" "}
                  kg Vol
                </span>
              </div>
              {saveStatusText && (
                <span style={{ fontSize: "12px", color: "#b6f23a", fontStyle: "italic" }}>
                  {saveStatusText}
                </span>
              )}
            </div>

            <div className="header-actions">
              {isActive ? (
                <>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={handleDiscard}
                    disabled={saving}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleSaveProgress}
                    disabled={saving}
                    title="Save current progress"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleFinish}
                    disabled={saving}
                  >
                    <Check size={16} /> Finish Workout
                  </button>
                </>
              ) : (
                <span
                  style={{
                    background: "rgba(182, 242, 58, 0.15)",
                    color: "#b6f23a",
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Workout Info & Notes Card */}
          <div className="workout-info-card">
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "14px",
                flexWrap: "wrap",
                color: "#9aa49d",
                fontSize: "13px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} />
                Started: {new Date(workout.startedAt).toLocaleString()}
              </span>
              {workout.completedAt && (
                <span>Completed: {new Date(workout.completedAt).toLocaleString()}</span>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#9aa49d",
                }}
              >
                Workout Notes
              </label>
              {isActive ? (
                <textarea
                  className="workout-notes-area"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="Record how this session felt, target weights, PRs, or energy levels..."
                />
              ) : (
                <p
                  style={{
                    background: "#0b0f0d",
                    padding: "12px",
                    borderRadius: "8px",
                    margin: 0,
                    fontSize: "14px",
                    color: workout.notes ? "#f5f7f5" : "#68726b",
                  }}
                >
                  {workout.notes || "No notes recorded for this workout."}
                </p>
              )}
            </div>

            {/* Media Attachment Section */}
            <div className="media-section">
              <div className="media-section-header">
                <label>Workout Photos &amp; Media ({media.length})</label>
                {isActive && (
                  <div className="media-upload-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      className="file-upload-label"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Media
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => setShowMediaUrlModal(true)}
                    >
                      <ImageIcon size={14} /> Add URL
                    </button>
                  </div>
                )}
              </div>

              {media.length > 0 ? (
                <div className="media-gallery-grid">
                  {media.map((item, idx) => (
                    <div key={idx} className="media-item-wrap">
                      {item.type === "video" ? (
                        <video src={item.url} className="media-item-img" controls />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Workout media ${idx + 1}`}
                          className="media-item-img"
                        />
                      )}
                      {isActive && (
                        <button
                          type="button"
                          className="btn-remove-media"
                          onClick={() => handleRemoveMedia(idx)}
                          title="Remove media"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "#68726b", margin: 0 }}>
                  No photos or videos attached to this workout.
                </p>
              )}
            </div>
          </div>

          {/* Exercises Section */}
          <div className="workout-exercises">
            <div className="section-header">
              <h2>Exercises ({localExercises.length})</h2>
              {isActive && (
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => setShowExercisePicker(true)}
                >
                  <Plus size={16} /> Add Exercise
                </button>
              )}
            </div>

            {localExercises.length === 0 ? (
              <div className="empty-exercises">
                <Dumbbell size={36} style={{ color: "#68726b", marginBottom: "8px" }} />
                <p>No exercises added to this workout yet.</p>
                {isActive && (
                  <button
                    type="button"
                    className="btn-primary-sm"
                    style={{ marginTop: "12px", display: "inline-flex" }}
                    onClick={() => setShowExercisePicker(true)}
                  >
                    <Plus size={16} /> Add First Exercise
                  </button>
                )}
              </div>
            ) : (
              localExercises.map((ex, exIndex) => (
                <div key={ex._id || exIndex} className="active-exercise-card">
                  <div className="active-exercise-header">
                    <div className="active-exercise-title">
                      {isActive && (
                        <div className="reorder-controls">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(exIndex, "up")}
                            disabled={exIndex === 0}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(exIndex, "down")}
                            disabled={exIndex === localExercises.length - 1}
                          >
                            ▼
                          </button>
                        </div>
                      )}
                      <h3>
                        {exIndex + 1}. {ex.exerciseName}
                      </h3>
                      {ex.muscleGroup && (
                        <span className="ex-muscle">{ex.muscleGroup}</span>
                      )}
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        className="btn-icon-delete"
                        onClick={() => handleRemoveExercise(exIndex)}
                        title="Remove exercise"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Sets Container */}
                  <div className="sets-container">
                    <div className="set-header-row">
                      <span>SET</span>
                      <span>KG</span>
                      <span>REPS</span>
                      <span>REST</span>
                      <span>DONE</span>
                      {isActive && <span></span>}
                    </div>

                    {ex.sets.map((set, setIndex) => (
                      <div
                        key={set._id || setIndex}
                        className={`set-row ${set.completed ? "completed" : ""}`}
                      >
                        <span className="set-num">
                          {setIndex + 1}
                          {set.isPR && (
                            <span
                              title="New Personal Record Set!"
                              style={{
                                color: "#ffd700",
                                marginLeft: "4px",
                                fontSize: "10px",
                                fontWeight: 800,
                              }}
                            >
                              ★PR
                            </span>
                          )}
                        </span>

                        <input
                          className="set-input"
                          type="number"
                          min="0"
                          value={set.weight}
                          placeholder="0"
                          disabled={!isActive}
                          onChange={(e) =>
                            handleUpdateSetField(
                              exIndex,
                              setIndex,
                              "weight",
                              e.target.value
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value.trim() === "") {
                              handleUpdateSetField(exIndex, setIndex, "weight", 0);
                            }
                          }}
                        />

                        <input
                          className="set-input"
                          type="number"
                          min="0"
                          value={set.reps}
                          placeholder="0"
                          disabled={!isActive}
                          onChange={(e) =>
                            handleUpdateSetField(
                              exIndex,
                              setIndex,
                              "reps",
                              e.target.value
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value.trim() === "") {
                              handleUpdateSetField(exIndex, setIndex, "reps", 0);
                            }
                          }}
                        />

                        <input
                          className="set-input"
                          type="number"
                          min="0"
                          value={set.restSeconds}
                          placeholder="60"
                          disabled={!isActive}
                          onChange={(e) =>
                            handleUpdateSetField(
                              exIndex,
                              setIndex,
                              "restSeconds",
                              e.target.value
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value.trim() === "") {
                              handleUpdateSetField(exIndex, setIndex, "restSeconds", 0);
                            }
                          }}
                        />

                        <button
                          type="button"
                          className="check-btn"
                          disabled={!isActive}
                          onClick={() => handleToggleSetCompleted(exIndex, setIndex)}
                          title={set.completed ? "Mark incomplete" : "Mark completed"}
                        >
                          <Check size={16} />
                        </button>

                        {isActive && (
                          <button
                            type="button"
                            className="btn-remove-set"
                            onClick={() => handleRemoveSet(exIndex, setIndex)}
                            disabled={ex.sets.length <= 1}
                            title="Remove set"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isActive && (
                    <button
                      type="button"
                      className="add-set-btn"
                      onClick={() => handleAddSet(exIndex)}
                    >
                      <Plus size={14} /> Add Set
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Exercise Picker Modal */}
          <ExercisePickerModal
            isOpen={showExercisePicker}
            onClose={() => setShowExercisePicker(false)}
            onSelectExercise={handleAddExercise}
          />

          {/* Media URL modal */}
          {showMediaUrlModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowMediaUrlModal(false)}
            >
              <div
                className="modal-content picker-modal"
                style={{ maxWidth: "440px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Add Media URL</h2>
                  <button
                    type="button"
                    className="btn-icon-close"
                    onClick={() => setShowMediaUrlModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "10px",
                  }}
                >
                  <input
                    className="standalone-input"
                    placeholder="https://example.com/photo.jpg"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    autoFocus
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowMediaUrlModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleAddMediaUrl}
                    >
                      Add Photo
                    </button>
                  </div>
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
