import { useState, useMemo } from "react";
import {
  Clock,
  Dumbbell,
  Trophy,
  Play,
  ArrowUpRight,
  Flame,
  Calendar,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import StatCard from "../components/dashboard/StatCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentWorkout from "../components/dashboard/RecentWorkout";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../context/WorkoutContext";
import { useAchievements } from "../context/AchievementContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workouts } = useWorkouts();
  const { achievements } = useAchievements();

  // Timeframe filter for stats: week, month, year, all
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year" | "all">("week");

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const completedWorkouts = useMemo(() => {
    return workouts.filter((w) => w.status === "completed");
  }, [workouts]);

  const activeWorkout = workouts.find((w) => w.status === "active");

  // Dynamic timeframe filtering
  const {
    filteredWorkouts,
    totalHoursStr,
    totalVolumeKg,
    timeframeAchievements,
    timeframeLabel,
  } = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (timeframe === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeframe === "month") {
      cutoff.setDate(now.getDate() - 30);
    } else if (timeframe === "year") {
      cutoff.setDate(now.getDate() - 365);
    } else {
      cutoff.setTime(0);
    }

    const filteredW = completedWorkouts.filter((w) => {
      const d = new Date(w.completedAt || w.startedAt);
      return d >= cutoff;
    });

    const totalSeconds = filteredW.reduce((acc, w) => {
      const durSec =
        w.duration !== undefined
          ? w.duration
          : w.completedAt && w.startedAt
          ? Math.max(0, Math.round((new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime()) / 1000))
          : 0;
      return acc + durSec;
    }, 0);

    const totalMins = Math.round(totalSeconds / 60);
    const hoursStr = totalMins >= 60
      ? `${(totalMins / 60).toFixed(1)} hrs`
      : `${totalMins} min`;

    const vol = filteredW.reduce((acc, w) => {
      let calculated = 0;
      if (w.volume !== undefined && w.volume > 0) {
        calculated = w.volume;
      } else {
        w.exercises?.forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (s.completed) {
              calculated += (Number(s.weight) || 0) * (Number(s.reps) || 0);
            }
          });
        });
      }
      return acc + calculated;
    }, 0);

    const filteredA = achievements.filter((a) => {
      const d = new Date(a.date);
      return d >= cutoff;
    });

    const labels = {
      week: "Past 7 Days",
      month: "Past 30 Days",
      year: "Past Year",
      all: "All Time",
    };

    return {
      filteredWorkouts: filteredW,
      totalHoursStr: hoursStr,
      totalVolumeKg: vol,
      timeframeAchievements: filteredA,
      timeframeLabel: labels[timeframe],
    };
  }, [completedWorkouts, achievements, timeframe]);

  // Current week progress for the Weekly Goal card (Monday to Sunday)
  const { weeklyCompleted, weeklyTarget, weeklyPct, weeklyGoalMsg } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = completedWorkouts.filter((w) => {
      const d = new Date(w.completedAt || w.startedAt);
      return d >= startOfWeek;
    });

    const target = 4;
    const completed = thisWeekWorkouts.length;
    const pct = Math.min(100, Math.round((completed / target) * 100));

    let msg = "Start your first session this week to build your streak!";
    if (completed >= target) {
      msg = `Weekly target achieved! (${completed}/${target} completed) 🔥 Keep the momentum going!`;
    } else if (completed > 0) {
      const left = target - completed;
      msg = `${left} more workout${left === 1 ? "" : "s"} to reach your weekly goal.`;
    }

    return {
      weeklyCompleted: completed,
      weeklyTarget: target,
      weeklyPct: pct,
      weeklyGoalMsg: msg,
    };
  }, [completedWorkouts]);

  // Latest 5 achievements history
  const latestFiveAchievements = useMemo(() => {
    return achievements.slice(0, 5);
  }, [achievements]);

  const handleStartWorkout = () => {
    if (activeWorkout) navigate(`/workouts/${activeWorkout._id}`);
    else navigate("/workouts");
  };

  // Circular progress calculations for SVG ring
  const strokeWidth = 9;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (weeklyPct / 100) * circumference;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Topbar />

        <main className="dashboard">
          {/* Welcome Banner */}
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR FITNESS JOURNEY</p>

              <h1>
                {greeting}, <span>{user?.name?.split(" ")[0] ?? "Athlete"}</span>
              </h1>

              <p className="welcome-text">
                Ready to make today's workout count?
              </p>
            </div>

            <button className="start-workout-button" onClick={handleStartWorkout}>
              <Play size={18} fill="currentColor" />
              {activeWorkout ? "Resume Workout" : "Start Workout"}
            </button>
          </section>

          {/* Timeframe Filter Bar & Statistics Grid */}
          <div className="dashboard-timeframe-header">
            <h3 className="dashboard-timeframe-title">
              <Calendar size={15} color="#b6f23a" /> Performance Overview
            </h3>

            <div className="timeframe-tabs">
              <button
                type="button"
                className={`timeframe-tab-btn ${timeframe === "week" ? "active" : ""}`}
                onClick={() => setTimeframe("week")}
              >
                Past 7 Days
              </button>
              <button
                type="button"
                className={`timeframe-tab-btn ${timeframe === "month" ? "active" : ""}`}
                onClick={() => setTimeframe("month")}
              >
                Past Month
              </button>
              <button
                type="button"
                className={`timeframe-tab-btn ${timeframe === "year" ? "active" : ""}`}
                onClick={() => setTimeframe("year")}
              >
                Past Year
              </button>
              <button
                type="button"
                className={`timeframe-tab-btn ${timeframe === "all" ? "active" : ""}`}
                onClick={() => setTimeframe("all")}
              >
                All Time
              </button>
            </div>
          </div>

          <section className="stats-grid">
            <StatCard
              title="WORKOUTS"
              value={String(filteredWorkouts.length)}
              subtitle={`In ${timeframeLabel}`}
              icon={Dumbbell}
            />

            <StatCard
              title="HOURS SPENT"
              value={totalHoursStr}
              subtitle={`Across ${filteredWorkouts.length} ${filteredWorkouts.length === 1 ? "session" : "sessions"}`}
              icon={Clock}
            />

            <StatCard
              title="VOLUME LIFTED"
              value={`${totalVolumeKg.toLocaleString()} kg`}
              subtitle="Total load moved"
              icon={Flame}
            />

            <StatCard
              title="PERSONAL RECORDS"
              value={String(timeframeAchievements.length)}
              subtitle={
                timeframeAchievements.length > 0
                  ? `Latest: ${timeframeAchievements[0].exerciseName}`
                  : `In ${timeframeLabel}`
              }
              icon={Trophy}
            />
          </section>

          {/* Activity Chart & Live Weekly Goal Grid */}
          <section className="dashboard-grid">
            <ActivityChart />

            <div className="goal-card">
              <div className="section-header">
                <div>
                  <h2>Weekly Goal</h2>
                  <p>Target: {weeklyTarget} workouts per week</p>
                </div>

                <ArrowUpRight size={18} color="#9aa49d" />
              </div>

              {/* Dynamic SVG Circular Progress Ring */}
              <div className="goal-circle-svg-wrapper">
                <svg width="150" height="150" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                  {/* Background Track */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke="#263025"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Active Progress Ring */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke="#b6f23a"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  />
                </svg>

                <div className="goal-circle-text">
                  <strong>{weeklyCompleted}</strong>
                  <span>/ {weeklyTarget} done</span>
                </div>
              </div>

              <p className="goal-text">{weeklyGoalMsg}</p>

              <div className="goal-progress" style={{ marginTop: "auto" }}>
                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${weeklyPct}%`,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </section>

          {/* 5 Achievements History Showcase */}
          <div className="recent-card" style={{ marginBottom: "24px" }}>
            <div className="section-header">
              <div>
                <h2>
                  <Trophy
                    size={18}
                    color="#ffd700"
                    style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
                  />
                  Personal Records & Achievements (Latest {latestFiveAchievements.length})
                </h2>
                <p>Your latest milestone breakthroughs</p>
              </div>

              <Link to="/exercises" className="view-all">
                View All Exercises <ArrowUpRight size={14} />
              </Link>
            </div>

            {latestFiveAchievements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 12px", color: "#68726b", fontSize: "12px" }}>
                <Trophy size={32} style={{ margin: "0 auto 10px", opacity: 0.3, color: "#ffd700" }} />
                <p>No Personal Records broken yet.</p>
                <p style={{ marginTop: "4px" }}>
                  Complete your first workout or log a lift to unlock your milestone trophies!
                </p>
                <Link
                  to="/exercises"
                  style={{ color: "#b6f23a", display: "inline-block", marginTop: "10px", fontWeight: 700 }}
                >
                  Explore Exercises & Log a Lift →
                </Link>
              </div>
            ) : (
              <div className="dashboard-achievements-grid">
                {latestFiveAchievements.map((ach) => (
                  <Link
                    key={ach._id}
                    to={`/exercises/${typeof ach.exercise === "object" ? ach.exercise._id : ach.exercise}`}
                    className="dashboard-achievement-card"
                    title="Click to view progression graph"
                  >
                    <div className="achievement-trophy-icon">
                      <Trophy size={20} />
                    </div>

                    <div className="achievement-badge-info" style={{ minWidth: 0 }}>
                      <h4
                        className="achievement-badge-title"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {ach.exerciseName}
                      </h4>
                      <p className="achievement-badge-desc">{ach.title}</p>
                      <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#8e9b90" }}>
                        {ach.weight} kg × {ach.reps} {ach.reps === 1 ? "rep" : "reps"}
                      </div>
                    </div>

                    <div className="achievement-badge-meta" style={{ flexShrink: 0 }}>
                      <span className="achievement-badge-val">{ach.value} kg</span>
                      {ach.improvement > 0 && (
                        <div style={{ fontSize: "10px", color: "#b6f23a", fontWeight: 700 }}>
                          +{ach.improvement} kg
                        </div>
                      )}
                      <div className="achievement-badge-date">
                        {new Date(ach.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Workouts */}
          <RecentWorkout />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}