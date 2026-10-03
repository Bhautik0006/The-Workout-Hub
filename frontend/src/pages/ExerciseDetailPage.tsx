import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useExercises } from "../context/ExerciseContext";
import type { ExerciseProgressEntry } from "../types/exerciseProgress";
import "./ExerciseDetailPage.css";

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getExercise, getProgressForExercise, addProgressEntry, deleteProgressEntry } = useExercises();
  
  const exercise = id ? getExercise(id) : undefined;
  const progressEntries = id ? getProgressForExercise(id) : [];

  const [showLogModal, setShowLogModal] = useState(false);
  const [metric, setMetric] = useState<"weight" | "volume" | "reps">("weight");
  const [timeRange, setTimeRange] = useState<number>(30); // days

  if (!exercise) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Topbar />
          <main className="dashboard">
            <div className="empty-state">
              <h3>Exercise Not Found</h3>
              <Link to="/exercises" className="btn-secondary">Return to Library</Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleLogPerformance = (entry: Omit<ExerciseProgressEntry, "id" | "exerciseId" | "createdAt">) => {
    addProgressEntry({
      id: `p_${Date.now()}`,
      exerciseId: exercise.id,
      createdAt: new Date().toISOString(),
      ...entry
    });
    setShowLogModal(false);
  };

  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeRange);
    
    return progressEntries
      .filter(p => timeRange === 0 || new Date(p.date) >= cutoff)
      .map(p => {
        const volume = (p.weight || 0) * (p.reps || 0) * (p.sets || 0);
        return {
          date: p.date,
          weight: p.weight,
          reps: p.reps,
          volume: volume > 0 ? volume : undefined,
          displayDate: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
      })
      .reverse(); // oldest to newest for chart
  }, [progressEntries, timeRange]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="dashboard ex-detail-page">
          <div className="detail-header">
            <Link to="/exercises" className="back-link">
              <ArrowLeft size={16} /> Exercise Library
            </Link>
            <button className="btn-primary" onClick={() => setShowLogModal(true)}>
              <Plus size={16} /> Log Performance
            </button>
          </div>

          <div className="ex-info-card">
            <div className="ex-info-main">
              <div className="ex-title-row">
                <h1>{exercise.name}</h1>
                {exercise.isCustom && <span className="custom-badge">Custom</span>}
              </div>
              <div className="ex-meta-tags">
                <span className="ex-muscle">{exercise.muscleGroup}</span>
                <span className="ex-equipment">{exercise.equipment}</span>
              </div>
              <p className="ex-desc">{exercise.description}</p>
            </div>
            {exercise.media && exercise.media.length > 0 && (
              exercise.media[0].type === "video" ? (
                <video src={exercise.media[0].url} className="ex-media-preview video" controls />
              ) : (
                <div className="ex-media-preview image" style={{ backgroundImage: `url(${exercise.media[0].url})` }} />
              )
            )}
          </div>

          <div className="progress-section">
            <div className="section-header">
              <h2>Progress Dashboard</h2>
              <div className="chart-controls">
                <select className="filter-select" value={metric} onChange={(e) => setMetric(e.target.value as any)}>
                  <option value="weight">Max Weight</option>
                  <option value="volume">Total Volume</option>
                  <option value="reps">Reps</option>
                </select>
                <select className="filter-select" value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))}>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={0}>All Time</option>
                </select>
              </div>
            </div>

            <div className="chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27302a" vertical={false} />
                    <XAxis dataKey="displayDate" stroke="#667069" tick={{fill: '#667069', fontSize: 12}} />
                    <YAxis stroke="#667069" tick={{fill: '#667069', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171e1a', borderColor: '#27302a', color: '#f5f7f5' }}
                      itemStyle={{ color: '#b6f23a' }}
                    />
                    <Line type="monotone" dataKey={metric} stroke="#b6f23a" strokeWidth={3} dot={{r: 4, fill: '#171e1a', stroke: '#b6f23a', strokeWidth: 2}} activeDot={{r: 6}} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <p>No progress data available for this period.</p>
                </div>
              )}
            </div>
          </div>

          <div className="history-section">
            <h2>History</h2>
            {progressEntries.length === 0 ? (
              <div className="empty-history">
                <p>No workout history recorded yet.</p>
              </div>
            ) : (
              <div className="history-list">
                {progressEntries.map(entry => (
                  <div key={entry.id} className="history-card">
                    <div className="history-date">
                      <Calendar size={14} />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="history-metrics">
                      {entry.weight !== undefined && <span><strong>{entry.weight}</strong> lbs</span>}
                      {entry.sets !== undefined && <span><strong>{entry.sets}</strong> sets</span>}
                      {entry.reps !== undefined && <span><strong>{entry.reps}</strong> reps</span>}
                      {entry.durationSeconds !== undefined && <span><strong>{entry.durationSeconds}</strong> sec</span>}
                      {entry.distance !== undefined && <span><strong>{entry.distance}</strong> miles</span>}
                    </div>
                    {entry.notes && <p className="history-notes">"{entry.notes}"</p>}
                    <button className="delete-entry" onClick={() => deleteProgressEntry(entry.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showLogModal && (
            <LogPerformanceModal onClose={() => setShowLogModal(false)} onSave={handleLogPerformance} />
          )}

        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function LogPerformanceModal({ onClose, onSave }: { onClose: () => void, onSave: (entry: any) => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    onSave({
      date,
      weight: weight ? Number(weight) : undefined,
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      notes: notes || undefined
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Log Performance</h2>
        
        <div className="form-group-modal">
          <label>Date *</label>
          <input type="date" className="standalone-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="form-group-row">
          <div className="form-group-modal half">
            <label>Weight (lbs)</label>
            <input type="number" className="standalone-input" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="form-group-modal half">
            <label>Sets</label>
            <input type="number" className="standalone-input" value={sets} onChange={e => setSets(e.target.value)} />
          </div>
          <div className="form-group-modal half">
            <label>Reps</label>
            <input type="number" className="standalone-input" value={reps} onChange={e => setReps(e.target.value)} />
          </div>
        </div>

        <div className="form-group-modal">
          <label>Notes</label>
          <input type="text" className="standalone-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel?" />
        </div>

        <div className="modal-actions" style={{marginTop: '20px'}}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Log</button>
        </div>
      </div>
    </div>
  );
}
