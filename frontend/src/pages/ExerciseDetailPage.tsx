import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Trophy,
  Dumbbell,
  TrendingUp,
  Activity,
  Calculator,
  Play,
  X,
  Flame,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import { useExercises } from "../context/ExerciseContext";
import { useWorkouts } from "../context/WorkoutContext";
import { useAchievements } from "../context/AchievementContext";
import { progressApi, type ProgressRecord } from "../api/progressApi";
import { achievementApi, type Achievement } from "../api/achievementApi";
import "./ExerciseDetailPage.css";

// Epley Formula for 1 Rep Max
export const calculateOneRepMax = (weight: number, reps: number): number => {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
};

interface MergedProgressItem {
  id: string;
  date: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  volume: number;
  source: string;
  isPR?: boolean;
}

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getExercise, loading: exLoading } = useExercises();
  const { workouts, activeWorkout, syncLocalWorkout } = useWorkouts();
  const { celebratePR } = useAchievements();

  const exercise = id ? getExercise(id) : undefined;

  const [dbProgress, setDbProgress] = useState<ProgressRecord[]>([]);
  const [exerciseAchievements, setExerciseAchievements] = useState<Achievement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [showLogModal, setShowLogModal] = useState(false);
  const [metric, setMetric] = useState<"oneRepMax" | "weight" | "volume" | "reps">("oneRepMax");
  const [timeRange, setTimeRange] = useState<number>(30); // days (0 = all time)

  // Interactive 1RM Calculator state
  const [calcWeight, setCalcWeight] = useState<number | string>(80);
  const [calcReps, setCalcReps] = useState<number | string>(8);

  const [addNotice, setAddNotice] = useState("");

  const fetchProgressData = useCallback(async () => {
    if (!id) return;
    setLoadingProgress(true);
    try {
      const [records, achList] = await Promise.all([
        progressApi.getProgress(id).catch(() => []),
        achievementApi.getAchievements({ exerciseId: id }).catch(() => []),
      ]);
      setDbProgress(records);
      setExerciseAchievements(achList);
    } catch (err) {
      console.error("Failed to load progress & achievements:", err);
    } finally {
      setLoadingProgress(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Combine Progress collection documents with completed workout exercises
  const mergedHistory: MergedProgressItem[] = useMemo(() => {
    if (!id) return [];
    const list: MergedProgressItem[] = [];
    const seenMap = new Set<string>();

    // 1. From backend Progress collection
    dbProgress.forEach((p) => {
      const w = Number(p.weight) || 0;
      const r = Number(p.reps) || 0;
      const orm = p.oneRepMax && p.oneRepMax > 0 ? p.oneRepMax : calculateOneRepMax(w, r);
      const vol = p.volume && p.volume > 0 ? p.volume : w * r;
      const sourceName = typeof p.sourceWorkout === "object" && p.sourceWorkout?.name
        ? p.sourceWorkout.name
        : p.sourceWorkout
        ? "Workout Session"
        : "Manual Log";

      const key = `${new Date(p.date).toISOString().slice(0, 16)}_${w}_${r}`;
      seenMap.add(key);

      list.push({
        id: p._id,
        date: p.date,
        weight: w,
        reps: r,
        oneRepMax: orm,
        volume: vol,
        source: sourceName,
      });
    });

    // 2. From completed workouts stored in context (if not already captured)
    workouts
      .filter((w) => w.status === "completed" && w.completedAt)
      .forEach((w) => {
        (w.exercises || []).forEach((ex) => {
          const exObj = typeof ex.exercise === "object" ? ex.exercise : null;
          const exId = exObj ? (exObj as any)._id ?? (exObj as any).id : ex.exercise;
          if (exId === id) {
            (ex.sets || [])
              .filter((s) => s.completed && (Number(s.weight) > 0 || Number(s.reps) > 0))
              .forEach((s, idx) => {
                const weight = Number(s.weight) || 0;
                const reps = Number(s.reps) || 0;
                const key = `${new Date(w.completedAt!).toISOString().slice(0, 16)}_${weight}_${reps}`;
                if (!seenMap.has(key)) {
                  seenMap.add(key);
                  list.push({
                    id: `${w._id}_${idx}`,
                    date: w.completedAt!,
                    weight,
                    reps,
                    oneRepMax: calculateOneRepMax(weight, reps),
                    volume: weight * reps,
                    source: w.name || "Workout Session",
                  });
                }
              });
          }
        });
      });

    // Sort chronologically ascending
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Flag Personal Records (PRs) chronologically
    let runningMaxORM = 0;
    list.forEach((item) => {
      if (item.oneRepMax > runningMaxORM) {
        item.isPR = true;
        runningMaxORM = item.oneRepMax;
      }
    });

    return list;
  }, [id, dbProgress, workouts]);

  // Key metrics calculation
  const metricsSummary = useMemo(() => {
    if (mergedHistory.length === 0) {
      return {
        allTime1RM: 0,
        maxWeight: 0,
        maxVolume: 0,
        totalSets: 0,
        improvementPct: 0,
      };
    }

    const allTime1RM = Math.max(...mergedHistory.map((m) => m.oneRepMax));
    const maxWeight = Math.max(...mergedHistory.map((m) => m.weight));
    const maxVolume = Math.max(...mergedHistory.map((m) => m.volume));
    const totalSets = mergedHistory.length;

    const firstORM = mergedHistory[0]?.oneRepMax || 0;
    const improvementPct =
      firstORM > 0 && allTime1RM > firstORM
        ? Math.round(((allTime1RM - firstORM) / firstORM) * 100)
        : 0;

    return {
      allTime1RM,
      maxWeight,
      maxVolume,
      totalSets,
      improvementPct,
    };
  }, [mergedHistory]);

  // Chart data filtered by selected timeframe
  const chartData = useMemo(() => {
    const cutoff = new Date();
    if (timeRange > 0) {
      cutoff.setDate(cutoff.getDate() - timeRange);
    }

    const filtered = mergedHistory.filter(
      (p) => timeRange === 0 || new Date(p.date) >= cutoff
    );

    // Group by day to show peak 1RM per session on the chart
    const dayMap = new Map<string, MergedProgressItem>();
    filtered.forEach((item) => {
      const dayKey = new Date(item.date).toLocaleDateString();
      const existing = dayMap.get(dayKey);
      if (!existing || item.oneRepMax > existing.oneRepMax) {
        dayMap.set(dayKey, item);
      }
    });

    return Array.from(dayMap.values()).map((p) => ({
      date: p.date,
      displayDate: new Date(p.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      fullDate: new Date(p.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      oneRepMax: p.oneRepMax,
      weight: p.weight,
      volume: p.volume,
      reps: p.reps,
      isPR: p.isPR,
      source: p.source,
    }));
  }, [mergedHistory, timeRange]);

  // Interactive 1RM Calculator Output
  const calculatedInteractive1RM = useMemo(() => {
    const w = Number(calcWeight) || 0;
    const r = Number(calcReps) || 0;
    return calculateOneRepMax(w, r);
  }, [calcWeight, calcReps]);

  // Add exercise to currently ongoing active workout
  const handleAddToActiveWorkout = () => {
    if (!activeWorkout || !exercise) return;
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
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
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

    setAddNotice(`Added "${exercise.name}" to your active session!`);
    setTimeout(() => setAddNotice(""), 2500);
  };

  if (exLoading && !exercise) {
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

  if (!exercise) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Topbar />
          <main className="dashboard">
            <div className="empty-state">
              <h3>Exercise Not Found</h3>
              <Link to="/exercises" className="btn-secondary" style={{ marginTop: "12px" }}>
                Return to Exercise Library
              </Link>
            </div>
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
        <main className="dashboard ex-detail-page">
          {/* Header & Back Action */}
          <div className="detail-header">
            <Link to="/exercises" className="back-link">
              <ArrowLeft size={16} /> Exercise Library
            </Link>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {activeWorkout && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddToActiveWorkout}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Plus size={16} /> Add to Active Workout
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => setShowLogModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} /> Log Performance
              </button>
            </div>
          </div>

          {/* Active Workout Banner if session is currently active */}
          {activeWorkout && (
            <div className="active-workout-banner">
              <div className="active-banner-info">
                <span className="active-pulse-dot" />
                <span>
                  Active Session: <strong>{activeWorkout.name}</strong>
                  {addNotice && (
                    <span style={{ marginLeft: "12px", color: "#b6f23a", fontWeight: 700 }}>
                      ✓ {addNotice}
                    </span>
                  )}
                </span>
              </div>
              <Link to={`/workouts/${activeWorkout._id}`} className="active-banner-resume">
                <Play size={14} fill="currentColor" /> Return to Session
              </Link>
            </div>
          )}

          {/* Exercise Info Card */}
          <div className="ex-info-card">
            <div className="ex-info-main">
              <div className="ex-title-row">
                <h1>{exercise.name}</h1>
                {exercise.isCustom && <span className="custom-badge">Custom</span>}
              </div>
              <div className="ex-meta-tags">
                <span className="ex-muscle">{exercise.muscleGroup || "Full Body"}</span>
                <span className="ex-equipment">{exercise.equipment || "Standard"}</span>
              </div>
              <p className="ex-desc">{exercise.description || "No specific instructions provided for this exercise."}</p>
            </div>
            {exercise.media && exercise.media.length > 0 && (
              exercise.media[0].type === "video" ? (
                <video src={exercise.media[0].url} className="ex-media-preview video" controls />
              ) : (
                <div
                  className="ex-media-preview image"
                  style={{ backgroundImage: `url(${exercise.media[0].url})` }}
                />
              )
            )}
          </div>

          {/* Key Metric Hero Cards */}
          <div className="stats-summary-grid">
            <div className="stat-metric-card highlight">
              <div className="stat-metric-icon">
                <Trophy size={20} />
              </div>
              <div className="stat-metric-content">
                <span className="stat-metric-label">Estimated 1 Rep Max</span>
                <span className="stat-metric-value">
                  {metricsSummary.allTime1RM > 0 ? `${metricsSummary.allTime1RM} kg` : "—"}
                </span>
                <span className="stat-metric-sub">
                  {metricsSummary.improvementPct > 0
                    ? `+${metricsSummary.improvementPct}% strength gain`
                    : "Standard Epley Model"}
                </span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-metric-icon">
                <Dumbbell size={20} />
              </div>
              <div className="stat-metric-content">
                <span className="stat-metric-label">Heaviest Weight</span>
                <span className="stat-metric-value">
                  {metricsSummary.maxWeight > 0 ? `${metricsSummary.maxWeight} kg` : "—"}
                </span>
                <span className="stat-metric-sub">Peak single set</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-metric-icon">
                <Flame size={20} />
              </div>
              <div className="stat-metric-content">
                <span className="stat-metric-label">Peak Session Volume</span>
                <span className="stat-metric-value">
                  {metricsSummary.maxVolume > 0 ? `${metricsSummary.maxVolume.toLocaleString()} kg` : "—"}
                </span>
                <span className="stat-metric-sub">Weight × Reps</span>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-metric-icon">
                <Activity size={20} />
              </div>
              <div className="stat-metric-content">
                <span className="stat-metric-label">Total Logged Sets</span>
                <span className="stat-metric-value">{metricsSummary.totalSets}</span>
                <span className="stat-metric-sub">Across all workouts</span>
              </div>
            </div>
          </div>

          {/* Interactive Graphical Chart Section */}
          <div className="progress-section">
            <div className="section-header">
              <h2>
                <TrendingUp size={20} color="#b6f23a" /> Progression Graph
                {loadingProgress && (
                  <span style={{ fontSize: "0.75rem", color: "#8e9b90", fontWeight: "normal", marginLeft: "10px" }}>
                    Syncing...
                  </span>
                )}
              </h2>

              <div className="chart-controls">
                <div className="metric-tabs">
                  <button
                    type="button"
                    className={`metric-tab-btn ${metric === "oneRepMax" ? "active" : ""}`}
                    onClick={() => setMetric("oneRepMax")}
                  >
                    1RM Est.
                  </button>
                  <button
                    type="button"
                    className={`metric-tab-btn ${metric === "weight" ? "active" : ""}`}
                    onClick={() => setMetric("weight")}
                  >
                    Weight
                  </button>
                  <button
                    type="button"
                    className={`metric-tab-btn ${metric === "volume" ? "active" : ""}`}
                    onClick={() => setMetric("volume")}
                  >
                    Volume
                  </button>
                  <button
                    type="button"
                    className={`metric-tab-btn ${metric === "reps" ? "active" : ""}`}
                    onClick={() => setMetric("reps")}
                  >
                    Reps
                  </button>
                </div>

                <select
                  className="filter-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e.target.value))}
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 3 Months</option>
                  <option value={180}>Last 6 Months</option>
                  <option value={365}>Last 1 Year</option>
                  <option value={0}>All Time</option>
                </select>
              </div>
            </div>

            <div className="chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b6f23a" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#b6f23a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232d26" vertical={false} />
                    <XAxis
                      dataKey="displayDate"
                      stroke="#667069"
                      tick={{ fill: "#667069", fontSize: 12 }}
                      axisLine={{ stroke: "#27302a" }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#667069"
                      tick={{ fill: "#667069", fontSize: 12 }}
                      axisLine={{ stroke: "#27302a" }}
                      tickLine={false}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const metricLabel =
                            metric === "oneRepMax"
                              ? "Estimated 1RM"
                              : metric === "weight"
                              ? "Weight"
                              : metric === "volume"
                              ? "Session Volume"
                              : "Reps";

                          const unit = metric === "reps" ? "reps" : "kg";

                          return (
                            <div className="custom-chart-tooltip">
                              <div className="tooltip-date">{data.fullDate}</div>
                              <div className="tooltip-main">
                                <span>{data[metric]?.toLocaleString()}</span>
                                <span className="tooltip-unit">{unit} {metricLabel}</span>
                              </div>
                              <div className="tooltip-detail">
                                <span>Lift: {data.weight} kg × {data.reps} reps</span>
                                {data.isPR && <span style={{ color: "#b6f23a", fontWeight: 700 }}>★ PR</span>}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={metric}
                      stroke="#b6f23a"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#chartGradient)"
                      dot={{ r: 4, fill: "#151c17", stroke: "#b6f23a", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#b6f23a", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <Activity size={32} />
                  <p>No workout performance logged for this timeframe.</p>
                  <button className="btn-secondary" onClick={() => setShowLogModal(true)}>
                    Log First Entry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Personal Records & Achievements Showcase */}
          {exerciseAchievements.length > 0 && (
            <div className="achievements-section" style={{ marginTop: "24px" }}>
              <div className="section-header" style={{ marginBottom: "14px" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.15rem", color: "#f8fafc" }}>
                  <Trophy size={19} color="#ffd700" /> Personal Records & Milestones ({exerciseAchievements.length})
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {exerciseAchievements.map((ach) => (
                  <div key={ach._id} className="achievement-badge-card">
                    <div className="achievement-trophy-icon">
                      <Trophy size={20} />
                    </div>
                    <div className="achievement-badge-info">
                      <h4 className="achievement-badge-title">{ach.title}</h4>
                      <p className="achievement-badge-desc">{ach.description}</p>
                      <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#8e9b90" }}>
                        Lift: {ach.weight} kg × {ach.reps} {ach.reps === 1 ? "rep" : "reps"}
                      </div>
                    </div>
                    <div className="achievement-badge-meta">
                      <span className="achievement-badge-val">{ach.value} kg</span>
                      <div className="achievement-badge-date">
                        {new Date(ach.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Column: History Records & Interactive 1RM Calculator */}
          <div className="details-split-grid" style={{ marginTop: exerciseAchievements.length > 0 ? "24px" : "0" }}>
            {/* Chronological History List */}
            <div className="history-section">
              <div className="history-section-header">
                <h3>
                  <Calendar size={18} color="#b6f23a" /> Performance History ({mergedHistory.length})
                </h3>
              </div>

              {mergedHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No sets or workouts recorded for this exercise yet.</p>
                  <p style={{ marginTop: "6px", fontSize: "12px" }}>
                    Complete a workout containing this exercise, or click <strong>Log Performance</strong> above to record your numbers.
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {[...mergedHistory].reverse().map((entry) => (
                    <div key={entry.id} className={`history-row ${entry.isPR ? "pr-row" : ""}`}>
                      <div className="history-col-date">
                        <span className="history-date-text">
                          <Calendar size={13} color="#79a82a" />
                          {new Date(entry.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="history-source-tag">{entry.source}</span>
                      </div>

                      <div className="history-col-performance">
                        <div className="metric-pill-item">
                          <span className="metric-pill-label">Lifted</span>
                          <span className="metric-pill-val">
                            {entry.weight} kg × {entry.reps}
                          </span>
                        </div>

                        <div className="metric-pill-item">
                          <span className="metric-pill-label">Est. 1RM</span>
                          <span className="metric-pill-val orm">
                            {entry.oneRepMax} kg
                          </span>
                        </div>

                        <div className="metric-pill-item">
                          <span className="metric-pill-label">Volume</span>
                          <span className="metric-pill-val">
                            {entry.volume.toLocaleString()} kg
                          </span>
                        </div>

                        {entry.isPR && <span className="pr-badge">★ PR</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 1RM Calculator Widget */}
            <div className="rm-calculator-card">
              <div className="rm-calculator-header">
                <h3>
                  <Calculator size={18} color="#b6f23a" /> 1RM Calculator
                </h3>
              </div>

              <div className="calculator-inputs">
                <div className="calc-input-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    placeholder="80"
                  />
                </div>
                <div className="calc-input-group">
                  <label>Reps Done</label>
                  <input
                    type="number"
                    value={calcReps}
                    onChange={(e) => setCalcReps(e.target.value)}
                    placeholder="8"
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div className="calc-result-banner">
                <span className="calc-result-label">Calculated 1 Rep Max</span>
                <h4 className="calc-result-value">{calculatedInteractive1RM} kg</h4>
                <span style={{ fontSize: "10px", color: "#667069" }}>
                  Epley Formula: Weight × (1 + Reps/30)
                </span>
              </div>

              <table className="calc-percentages-table">
                <thead>
                  <tr>
                    <th>% 1RM</th>
                    <th>Target Reps</th>
                    <th style={{ textAlign: "right" }}>Load</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pct: 100, reps: "1 rep" },
                    { pct: 95, reps: "2 reps" },
                    { pct: 90, reps: "3-4 reps" },
                    { pct: 85, reps: "5-6 reps" },
                    { pct: 80, reps: "7-8 reps" },
                    { pct: 75, reps: "9-10 reps" },
                    { pct: 70, reps: "11-12 reps" },
                  ].map((row) => {
                    const targetWeight =
                      calculatedInteractive1RM > 0
                        ? Math.round((calculatedInteractive1RM * row.pct) / 100)
                        : 0;
                    return (
                      <tr key={row.pct}>
                        <td>{row.pct}%</td>
                        <td style={{ color: "#9aa49d" }}>{row.reps}</td>
                        <td>{targetWeight} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Logging Modal */}
          {showLogModal && (
            <LogPerformanceModal
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              onClose={() => setShowLogModal(false)}
              onSuccess={(achievements) => {
                setShowLogModal(false);
                fetchProgressData();
                if (achievements && achievements.length > 0) {
                  celebratePR(achievements);
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

// Modal for manual progress record entry
function LogPerformanceModal({
  exerciseId,
  exerciseName,
  onClose,
  onSuccess,
}: {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
  onSuccess: (achievements?: Achievement[]) => void;
}) {
  const [weight, setWeight] = useState<number | string>("");
  const [reps, setReps] = useState<number | string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const estimated1RM = useMemo(() => {
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    return calculateOneRepMax(w, r);
  }, [weight, reps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(weight);
    const r = Number(reps);
    if (isNaN(w) || w <= 0) {
      setError("Please enter a valid weight (kg)");
      return;
    }
    if (isNaN(r) || r <= 0) {
      setError("Please enter a valid number of repetitions");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res: any = await progressApi.recordProgress({
        exercise: exerciseId,
        weight: w,
        reps: r,
        oneRepMax: estimated1RM,
        volume: w * r,
        date: new Date(date).toISOString(),
      });
      onSuccess(res?.achievements || []);
    } catch (err: any) {
      setError(err.message || "Failed to record progress entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content log-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2>Log Performance</h2>
          <button
            type="button"
            className="btn-icon-close"
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#9aa49d", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="modal-desc">
          Record a new set for <strong>{exerciseName}</strong>. This updates your 1RM progression history and charts.
        </p>

        {error && <div className="error-message" style={{ marginBottom: "16px" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label>Weight (kg) *</label>
            <input
              type="number"
              step="any"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError("");
              }}
              placeholder="e.g. 80"
              autoFocus
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Repetitions *</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => {
                setReps(e.target.value);
                setError("");
              }}
              placeholder="e.g. 8"
              min="1"
              max="100"
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {estimated1RM > 0 && (
            <div className="calculated-preview">
              <span>Calculated 1RM:</span>
              <strong>{estimated1RM} kg</strong>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
