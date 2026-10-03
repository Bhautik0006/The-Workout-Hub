import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Dumbbell } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useTemplates } from "../context/TemplateContext";
import type { Template } from "../types/template";
import "./TemplatesPage.css";

export default function TemplatesPage() {
  const { templates, deleteTemplate } = useTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category)))];

  const confirmDelete = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Topbar />

        <main className="dashboard templates-page">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR ROUTINES</p>
              <h1>
                Workout <span>Templates</span>
              </h1>
              <p className="welcome-text">Build your routines. Train with purpose.</p>
              <p className="template-count">{templates.length} templates available</p>
            </div>

            <Link to="/templates/new" className="start-workout-button">
              <Plus size={18} />
              Create Template
            </Link>
          </section>

          <section className="templates-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              {(searchTerm || filterCategory !== "All") && (
                <button className="clear-filters" onClick={() => { setSearchTerm(""); setFilterCategory("All"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          </section>

          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <Dumbbell size={48} className="empty-icon" />
              <h3>No templates found</h3>
              <p>Create a new template to get started.</p>
              <Link to="/templates/new" className="start-workout-button">Create Template</Link>
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onDelete={() => setDeleteId(template.id)}
                />
              ))}
            </div>
          )}

          {deleteId && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Delete Template?</h2>
                <p>Are you sure you want to delete this template? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                  <button className="btn-delete" onClick={confirmDelete}>Delete</button>
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

function TemplateCard({ template, onDelete }: { template: Template, onDelete: () => void }) {
  const totalSets = template.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  return (
    <div className="template-card">
      <div className="template-card-header">
        <h3>{template.name}</h3>
        <span className="category-badge">{template.category}</span>
      </div>
      <p className="template-desc">{template.description}</p>
      
      <div className="template-stats">
        <span>{template.exercises.length} Exercises</span>
        <span>•</span>
        <span>{totalSets} Sets</span>
      </div>

      <div className="template-exercises-preview">
        {template.exercises.slice(0, 3).map((ex, i) => (
          <div key={ex.id} className="preview-item">
            <span className="dot"></span>
            Exercise {i+1} ({ex.sets} sets)
          </div>
        ))}
        {template.exercises.length > 3 && (
          <div className="preview-more">+{template.exercises.length - 3} more</div>
        )}
      </div>

      <div className="template-card-actions">
        <Link to={`/templates/${template.id}`} className="btn-view">
          View / Edit
        </Link>
        <button className="btn-icon-delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
