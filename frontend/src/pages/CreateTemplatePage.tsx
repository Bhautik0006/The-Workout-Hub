import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useTemplates } from "../context/TemplateContext";
import type { Template, ExercisePrescription, MuscleGroup } from "../types/template";
import { MOCK_EXERCISES } from "../data/mockExercises";
import "./TemplateForm.css";

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const { addTemplate } = useTemplates();
  
  const [template, setTemplate] = useState<Partial<Template>>({
    name: "",
    description: "",
    category: "Full Body",
    exercises: []
  });
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!template.name) {
      setError("Template name is required");
      return;
    }
    
    const newTemplate: Template = {
      id: `t_${Date.now()}`,
      name: template.name,
      description: template.description || "",
      category: (template.category as MuscleGroup) || "Full Body",
      exercises: template.exercises || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addTemplate(newTemplate);
    navigate(`/templates/${newTemplate.id}`);
  };

  const updateExercise = (index: number, field: keyof ExercisePrescription, value: any) => {
    const newExercises = [...(template.exercises || [])];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setTemplate({ ...template, exercises: newExercises });
  };

  const removeExercise = (index: number) => {
    const newExercises = (template.exercises || []).filter((_, i) => i !== index);
    setTemplate({ ...template, exercises: newExercises });
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const exercises = template.exercises || [];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;
    
    const newExercises = [...exercises];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newExercises[index], newExercises[swapIndex]] = [newExercises[swapIndex], newExercises[index]];
    setTemplate({ ...template, exercises: newExercises });
  };

  const addExercise = (exerciseId: string) => {
    const newPrescription: ExercisePrescription = {
      id: `ep_${Date.now()}`,
      exerciseId,
      sets: 3,
      reps: 10,
      restDuration: 60,
    };
    setTemplate({
      ...template,
      exercises: [...(template.exercises || []), newPrescription]
    });
    setShowExercisePicker(false);
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
              Cancel & Back
            </Link>
            <div className="header-actions">
              <button className="btn-primary" onClick={handleSave}>
                <Save size={16} /> Create Template
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
                  value={template.name} 
                  placeholder="e.g. Heavy Push Day"
                  onChange={e => { setTemplate({...template, name: e.target.value}); setError(""); }} 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="standalone-input" 
                  value={template.category}
                  onChange={e => setTemplate({...template, category: e.target.value as MuscleGroup})}
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
                  value={template.description} 
                  placeholder="Describe the focus of this workout..."
                  onChange={e => setTemplate({...template, description: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="exercises-section">
            <div className="section-header">
              <h2>Exercises</h2>
              <button className="btn-primary-sm" onClick={() => setShowExercisePicker(true)}>
                <Plus size={16} /> Add Exercise
              </button>
            </div>

            <div className="exercises-list">
              {(template.exercises || []).length === 0 ? (
                <div className="empty-exercises">
                  <p>No exercises added yet. Click 'Add Exercise' to start building your template.</p>
                </div>
              ) : (template.exercises || []).map((ex, index) => {
                const exerciseDetails = MOCK_EXERCISES.find(e => e.id === ex.exerciseId);
                if (!exerciseDetails) return null;

                return (
                  <div key={ex.id} className="exercise-card">
                    <div className="exercise-card-header">
                      <div className="ex-title-wrap">
                        <div className="reorder-controls">
                          <button onClick={() => moveExercise(index, 'up')} disabled={index === 0}>▲</button>
                          <button onClick={() => moveExercise(index, 'down')} disabled={index === (template.exercises || []).length - 1}>▼</button>
                        </div>
                        <h3>{index + 1}. {exerciseDetails.name}</h3>
                        <span className="ex-muscle">{exerciseDetails.targetMuscleGroup}</span>
                      </div>
                      <button className="btn-icon-delete" onClick={() => removeExercise(index)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="exercise-prescription">
                      <div className="presc-item">
                        <label>Sets</label>
                        <input type="number" min="1" className="presc-input" value={ex.sets} onChange={e => updateExercise(index, 'sets', parseInt(e.target.value) || 1)} />
                      </div>
                      <div className="presc-item">
                        <label>Reps / Duration</label>
                        <input type="text" className="presc-input" value={ex.reps} onChange={e => updateExercise(index, 'reps', e.target.value)} />
                      </div>
                      <div className="presc-item">
                        <label>Weight (opt)</label>
                        <input type="text" className="presc-input" value={ex.weight || ''} placeholder="e.g. 135 lbs" onChange={e => updateExercise(index, 'weight', e.target.value)} />
                      </div>
                      <div className="presc-item">
                        <label>Rest (sec)</label>
                        <input type="number" className="presc-input" value={ex.restDuration || 0} onChange={e => updateExercise(index, 'restDuration', parseInt(e.target.value) || 0)} />
                      </div>
                    </div>
                    
                    <div className="presc-notes">
                      <label>Notes</label>
                      <input type="text" className="standalone-input" value={ex.notes || ''} placeholder="Add exercise notes..." onChange={e => updateExercise(index, 'notes', e.target.value)} />
                    </div>
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
