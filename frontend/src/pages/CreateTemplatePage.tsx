import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import ExercisePickerModal from "../components/ExercisePickerModal";
import { useTemplates } from "../context/TemplateContext";
import { useExercises } from "../context/ExerciseContext";
import "./TemplateForm.css";

export interface LocalExercise {
  exerciseId: string;       // DB _id of Exercise
  exerciseName: string;     // display name
  muscleGroup: string;
  equipment?: string;
  sets: number | string;
  reps: number | string;
  restSeconds: number | string;
  notes: string;
}

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const { createTemplate } = useTemplates();
  const { exercises } = useExercises();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Full Body");
  const [localExercises, setLocalExercises] = useState<LocalExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      // Any field that is left out / cleared defaults to 0
      const formattedExercises = localExercises.map((ex) => {
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

      const created = await createTemplate({
        name: name.trim(),
        description,
        category,
        exercises: formattedExercises,
      });

      navigate(`/templates/${created._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = (
    index: number,
    field: keyof LocalExercise,
    value: any
  ) => {
    const updated = [...localExercises];
    updated[index] = { ...updated[index], [field]: value };
    setLocalExercises(updated);
  };

  const removeExercise = (index: number) => {
    setLocalExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === localExercises.length - 1) return;
    const copy = [...localExercises];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [copy[index], copy[swapIdx]] = [copy[swapIdx], copy[index]];
    setLocalExercises(copy);
  };

  const addExercise = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    setLocalExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        sets: 3,         // Standard default preset
        reps: 10,        // Standard default preset
        restSeconds: 60, // Standard default preset
        notes: "",
      },
    ]);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard template-detail-page">
          <div className="detail-header">
            <Link to="/templates" className="back-link">
              <ArrowLeft size={16} />
              Cancel &amp; Back
            </Link>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Create Template"}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="template-info-card">
            <div className="form-group-row">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  className="standalone-input"
                  value={name}
                  placeholder="e.g. Heavy Push Day"
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="standalone-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  value={description}
                  placeholder="Describe the focus of this workout..."
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="exercises-section">
            <div className="section-header">
              <h2>Exercises</h2>
              <button
                type="button"
                className="btn-primary-sm"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={16} /> Add Exercise
              </button>
            </div>

            <div className="exercises-list">
              {localExercises.length === 0 ? (
                <div className="empty-exercises">
                  <p>No exercises added yet. Click 'Add Exercise' to start building your template.</p>
                </div>
              ) : (
                localExercises.map((ex, index) => (
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
                            disabled={index === localExercises.length - 1}
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
