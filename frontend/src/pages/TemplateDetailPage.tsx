import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useTemplates } from "../context/TemplateContext";
import type { Template, ExercisePrescription, MuscleGroup } from "../types/template";
import { MOCK_EXERCISES } from "../data/mockExercises";
import "./TemplateForm.css";

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate, deleteTemplate } = useTemplates();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Template | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getTemplate(id);
      if (found) {
        setTemplate(found);
        setEditedTemplate(found);
      } else {
        navigate("/templates");
      }
    }
  }, [id, getTemplate, navigate]);

  if (!template || !editedTemplate) return null;

  const handleSave = () => {
    const updated = { ...editedTemplate, updatedAt: new Date().toISOString() };
    updateTemplate(updated);
    setTemplate(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTemplate(template);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(template.id);
      navigate("/templates");
    }
  };

  const updateExercise = (index: number, field: keyof ExercisePrescription, value: any) => {
    const newExercises = [...editedTemplate.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setEditedTemplate({ ...editedTemplate, exercises: newExercises });
  };

  const removeExercise = (index: number) => {
    const newExercises = editedTemplate.exercises.filter((_, i) => i !== index);
    setEditedTemplate({ ...editedTemplate, exercises: newExercises });
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editedTemplate.exercises.length - 1) return;
    
    const newExercises = [...editedTemplate.exercises];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[swapIndex]] = [newExercises[swapIndex], newExercises[index]];
    setEditedTemplate({ ...editedTemplate, exercises: newExercises });
  };

  const addExercise = (exerciseId: string) => {
    const newPrescription: ExercisePrescription = {
      id: `ep_${Date.now()}`,
      exerciseId,
      sets: 3,
      reps: 10,
      restDuration: 60,
    };
    setEditedTemplate({
      ...editedTemplate,
      exercises: [...editedTemplate.exercises, newPrescription]
    });
    setShowExercisePicker(false);
  };

  const totalSets = (isEditing ? editedTemplate : template).exercises.reduce((sum, ex) => sum + Number(ex.sets), 0);
  const exerciseCount = (isEditing ? editedTemplate : template).exercises.length;

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
                  <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn-danger-outline" onClick={handleDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={handleCancel}>
                    <X size={16} /> Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="template-info-card">
            {isEditing ? (
              <div className="form-group-row">
                <div className="form-group">
                  <label>Template Name</label>
                  <input 
                    className="standalone-input" 
                    value={editedTemplate.name} 
                    onChange={e => setEditedTemplate({...editedTemplate, name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="standalone-input" 
                    value={editedTemplate.category}
                    onChange={e => setEditedTemplate({...editedTemplate, category: e.target.value as MuscleGroup})}
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    className="standalone-input textarea" 
                    value={editedTemplate.description} 
                    onChange={e => setEditedTemplate({...editedTemplate, description: e.target.value})} 
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
                  <span>Last updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="exercises-section">
            <div className="section-header">
              <h2>Exercises</h2>
              {isEditing && (
                <button className="btn-primary-sm" onClick={() => setShowExercisePicker(true)}>
                  <Plus size={16} /> Add Exercise
                </button>
              )}
            </div>

            <div className="exercises-list">
              {(isEditing ? editedTemplate.exercises : template.exercises).map((ex, index) => {
                const exerciseDetails = MOCK_EXERCISES.find(e => e.id === ex.exerciseId);
                if (!exerciseDetails) return null;

                return (
                  <div key={ex.id} className="exercise-card">
                    <div className="exercise-card-header">
                      <div className="ex-title-wrap">
                        {isEditing && (
                          <div className="reorder-controls">
                            <button onClick={() => moveExercise(index, 'up')} disabled={index === 0}>▲</button>
                            <button onClick={() => moveExercise(index, 'down')} disabled={index === editedTemplate.exercises.length - 1}>▼</button>
                          </div>
                        )}
                        <h3>{index + 1}. {exerciseDetails.name}</h3>
                        <span className="ex-muscle">{exerciseDetails.targetMuscleGroup}</span>
                      </div>
                      {isEditing && (
                        <button className="btn-icon-delete" onClick={() => removeExercise(index)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="exercise-prescription">
                      <div className="presc-item">
                        <label>Sets</label>
                        {isEditing ? (
                          <input type="number" min="1" className="presc-input" value={ex.sets} onChange={e => updateExercise(index, 'sets', parseInt(e.target.value) || 1)} />
                        ) : <span>{ex.sets}</span>}
                      </div>
                      <div className="presc-item">
                        <label>Reps / Duration</label>
                        {isEditing ? (
                          <input type="text" className="presc-input" value={ex.reps} onChange={e => updateExercise(index, 'reps', e.target.value)} />
                        ) : <span>{ex.reps}</span>}
                      </div>
                      <div className="presc-item">
                        <label>Weight (opt)</label>
                        {isEditing ? (
                          <input type="text" className="presc-input" value={ex.weight || ''} placeholder="e.g. 135 lbs" onChange={e => updateExercise(index, 'weight', e.target.value)} />
                        ) : <span>{ex.weight || '-'}</span>}
                      </div>
                      <div className="presc-item">
                        <label>Rest (sec)</label>
                        {isEditing ? (
                          <input type="number" className="presc-input" value={ex.restDuration || 0} onChange={e => updateExercise(index, 'restDuration', parseInt(e.target.value) || 0)} />
                        ) : <span>{ex.restDuration ? `${ex.restDuration}s` : '-'}</span>}
                      </div>
                    </div>
                    
                    {(isEditing || ex.notes) && (
                      <div className="presc-notes">
                        <label>Notes</label>
                        {isEditing ? (
                          <input type="text" className="standalone-input" value={ex.notes || ''} placeholder="Add exercise notes..." onChange={e => updateExercise(index, 'notes', e.target.value)} />
                        ) : <p>{ex.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showExercisePicker && (
            <div className="modal-overlay">
              <div className="modal-content picker-modal">
                <div className="modal-header">
                  <h2>Select Exercise</h2>
                  <button className="btn-icon-close" onClick={() => setShowExercisePicker(false)}><X size={20} /></button>
                </div>
                <div className="picker-list">
                  {MOCK_EXERCISES.map(ex => (
                    <button key={ex.id} className="picker-item" onClick={() => addExercise(ex.id)}>
                      <div className="picker-item-name">{ex.name}</div>
                      <div className="picker-item-meta">{ex.targetMuscleGroup} • {ex.equipment}</div>
                    </button>
                  ))}
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
