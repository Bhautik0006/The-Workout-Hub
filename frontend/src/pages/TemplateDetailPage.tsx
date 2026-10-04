import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Trash2, Plus } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import ExercisePickerModal from "../components/ExercisePickerModal";
import { useTemplates } from "../context/TemplateContext";
import { useExercises } from "../context/ExerciseContext";
import { templateApi, type ApiTemplate, type ApiTemplateExercise } from "../api/templateApi";
import type { LocalExercise } from "./CreateTemplatePage";
import "./TemplateForm.css";

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, deleteTemplate, loading } = useTemplates();
  const { exercises } = useExercises();

  const [template, setTemplate] = useState<ApiTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Full Body");
  const [editLocalExercises, setEditLocalExercises] = useState<LocalExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const populateEditState = (currentTemplate: ApiTemplate) => {
    setEditName(currentTemplate.name);
    setEditDescription(currentTemplate.description ?? "");
    setEditCategory(currentTemplate.category ?? "Full Body");
    const mapped: LocalExercise[] = (currentTemplate.exercises || []).map((ex) => {
      const setsCount = ex.sets?.length ?? 0;
      const firstSetReps = ex.sets?.[0]?.reps ?? 0;
      const rest = ex.restSeconds ?? ex.sets?.[0]?.restSeconds ?? 0;
      return {
        exerciseId: ex.exercise?._id || "",
        exerciseName: ex.exercise?.name || "Unknown Exercise",
        muscleGroup: ex.exercise?.muscleGroup || "",
        equipment: ex.exercise?.equipment || "",
        sets: setsCount,
        reps: firstSetReps,
        restSeconds: rest,
        notes: ex.notes || ex.sets?.[0]?.notes || "",
      };
    });
    setEditLocalExercises(mapped);
  };

  useEffect(() => {
    if (!id) return;
    const found = getTemplate(id);
    if (found) {
      setTemplate(found);
      populateEditState(found);
    } else if (!loading) {
      templateApi
        .getTemplate(id)
        .then((data: ApiTemplate) => {
          setTemplate(data);
          populateEditState(data);
        })
        .catch(() => {
          navigate("/templates");
        });
    }
  }, [id, loading, getTemplate, navigate]);

  if (!template) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="content-area loading-spinner-container">
            <div className="spinner"></div>
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }

  const startEditing = () => {
    populateEditState(template);
    setError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setError("Template name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Any field that is left out / cleared defaults to 0
      const formattedExercises = editLocalExercises.map((ex) => {
        const setsCount =
          ex.sets === "" || isNaN(Number(ex.sets))
            ? 0
            : Math.max(0, parseInt(String(ex.sets), 10));
        const repsCount =
          ex.reps === "" || isNaN(Number(ex.reps))
            ? 0
            : Math.max(0, parseInt(String(ex.reps), 10));
        const restCount =
          ex.restSeconds === "" || isNaN(Number(ex.restSeconds))
            ? 0
            : Math.max(0, parseInt(String(ex.restSeconds), 10));

        const setObjs = Array.from({ length: setsCount }, () => ({
          reps: repsCount,
          restSeconds: restCount,
          notes: ex.notes?.trim() || undefined,
        }));

        return {
          exercise: ex.exerciseId,
          sets: setObjs,
          notes: ex.notes?.trim() || undefined,
          restSeconds: restCount,
        };
      });

      const updated = await updateTemplate(template._id, {
        name: editName.trim(),
        description: editDescription,
        category: editCategory,
        exercises: formattedExercises,
      });

      setTemplate(updated);
      populateEditState(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    populateEditState(template);
    setError("");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(template._id);
        navigate("/templates");
      } catch (err: any) {
        alert(err.message || "Failed to delete template");
      }
    }
  };

  const updateExercise = (
    index: number,
    field: keyof LocalExercise,
    value: any
  ) => {
    const updated = [...editLocalExercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditLocalExercises(updated);
  };

  const removeExercise = (index: number) => {
    setEditLocalExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === editLocalExercises.length - 1) return;
    const copy = [...editLocalExercises];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [copy[index], copy[swapIdx]] = [copy[swapIdx], copy[index]];
    setEditLocalExercises(copy);
  };

  const addExercise = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    setEditLocalExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        sets: 3,         // Default to 3 initially
        reps: 10,        // Default to 10 initially
        restSeconds: 60, // Default to 60 initially
        notes: "",
      },
    ]);
  };

  const totalSets = (isEditing ? editLocalExercises : template.exercises).reduce(
    (sum, ex: any) => sum + (isEditing ? Number(ex.sets) || 0 : ex.sets?.length ?? 0),
    0
  );
  const exerciseCount = isEditing ? editLocalExercises.length : template.exercises.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard template-detail-page">
          <div className="detail-header">
            <Link to="/templates" className="back-link">
              <ArrowLeft size={16} />
              Back to Templates
            </Link>
            <div className="header-actions">
              {!isEditing ? (
                <>
                  <button className="btn-secondary" onClick={startEditing}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn-danger-outline" onClick={handleDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="template-info-card">
            {isEditing ? (
              <div className="form-group-row">
                <div className="form-group">
                  <label>Template Name *</label>
                  <input
                    className="standalone-input"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setError("");
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="standalone-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {[
                      "Chest",
                      "Back",
                      "Legs",
                      "Shoulders",
                      "Arms",
                      "Core",
                      "Full Body",
                      "Cardio",
                      "Other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    className="standalone-input textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="template-title-row">
                  <h1>{template.name}</h1>
                  <span className="category-badge">{template.category}</span>
                </div>
                <p className="template-description">{template.description}</p>
                <div className="template-meta">
                  <span>{exerciseCount} Exercises</span>
                  <span>•</span>
                  <span>{totalSets} Sets Total</span>
                  <span>•</span>
                  <span>
                    Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="exercises-section">
            <div className="section-header">
              <h2>Exercises</h2>
              {isEditing && (
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => setShowExercisePicker(true)}
                >
                  <Plus size={16} /> Add Exercise
                </button>
              )}
            </div>

            <div className="exercises-list">
              {isEditing ? (
                editLocalExercises.length === 0 ? (
                  <div className="empty-exercises">
                    <p>No exercises in this template yet. Click 'Add Exercise' to add one.</p>
                  </div>
                ) : (
                  editLocalExercises.map((ex, index) => (
                    <div key={index} className="exercise-card">
                      <div className="exercise-card-header">
                        <div className="ex-title-wrap">
                          <div className="reorder-controls">
                            <button
                              type="button"
                              onClick={() => moveExercise(index, "up")}
                              disabled={index === 0}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => moveExercise(index, "down")}
                              disabled={index === editLocalExercises.length - 1}
                            >
                              ▼
                            </button>
                          </div>
                          <h3>
                            {index + 1}. {ex.exerciseName}
                          </h3>
                          <span className="ex-muscle">{ex.muscleGroup}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-icon-delete"
                          onClick={() => removeExercise(index)}
                          title="Remove exercise"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="exercise-prescription">
                        <div className="presc-item">
                          <label>Sets</label>
                          <input
                            type="number"
                            min="0"
                            className="presc-input"
                            value={ex.sets}
                            placeholder="0"
                            onChange={(e) =>
                              updateExercise(index, "sets", e.target.value)
                            }
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") {
                                updateExercise(index, "sets", 0);
                              }
                            }}
                          />
                        </div>
                        <div className="presc-item">
                          <label>Reps / Duration</label>
                          <input
                            type="number"
                            min="0"
                            className="presc-input"
                            value={ex.reps}
                            placeholder="0"
                            onChange={(e) =>
                              updateExercise(index, "reps", e.target.value)
                            }
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") {
                                updateExercise(index, "reps", 0);
                              }
                            }}
                          />
                        </div>
                        <div className="presc-item">
                          <label>Rest (sec)</label>
                          <input
                            type="number"
                            min="0"
                            className="presc-input"
                            value={ex.restSeconds}
                            placeholder="0"
                            onChange={(e) =>
                              updateExercise(index, "restSeconds", e.target.value)
                            }
                            onBlur={(e) => {
                              if (e.target.value.trim() === "") {
                                updateExercise(index, "restSeconds", 0);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="presc-notes">
                        <label>Notes</label>
                        <input
                          type="text"
                          className="standalone-input"
                          value={ex.notes}
                          placeholder="Add exercise notes..."
                          onChange={(e) =>
                            updateExercise(index, "notes", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))
                )
              ) : template.exercises.length === 0 ? (
                <div className="empty-exercises">
                  <p>No exercises in this template yet.</p>
                </div>
              ) : (
                template.exercises.map((ex, index) => (
                  <ExerciseRow key={ex._id ?? index} ex={ex} index={index} />
                ))
              )}
            </div>
          </div>

          <ExercisePickerModal
            isOpen={showExercisePicker}
            onClose={() => setShowExercisePicker(false)}
            onSelectExercise={addExercise}
          />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function ExerciseRow({ ex, index }: { ex: ApiTemplateExercise; index: number }) {
  const name = ex.exercise?.name ?? `Exercise ${index + 1}`;
  const muscleGroup = ex.exercise?.muscleGroup ?? "";
  const sets = ex.sets ?? [];

  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <div className="ex-title-wrap">
          <h3>
            {index + 1}. {name}
          </h3>
          {muscleGroup && <span className="ex-muscle">{muscleGroup}</span>}
        </div>
      </div>

      <div className="exercise-prescription">
        <div className="presc-item">
          <label>Sets</label>
          <span>{sets.length}</span>
        </div>
        <div className="presc-item">
          <label>Reps / Duration</label>
          <span>{sets[0]?.reps ?? sets[0]?.duration ?? "0"}</span>
        </div>
        <div className="presc-item">
          <label>Rest (sec)</label>
          <span>{ex.restSeconds ?? sets[0]?.restSeconds ?? "0"}s</span>
        </div>
      </div>

      {ex.notes && (
        <div className="presc-notes">
          <label>Notes</label>
          <p>{ex.notes}</p>
        </div>
      )}
    </div>
  );
}
