import { useState, useMemo } from "react";
import { useWorkouts } from "../../context/WorkoutContext";

export default function ActivityChart() {
  const { workouts } = useWorkouts();
  const [period, setPeriod] = useState<"this_week" | "last_week" | "this_month">("this_week");
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const completedWorkouts = useMemo(() => {
    return workouts.filter((w) => w.status === "completed" && (w.completedAt || w.startedAt));
  }, [workouts]);

  // Compute daily activity based on selected period
  const { chartDays, totalDurationMins, activeDaysCount, periodLabel } = useMemo(() => {
    const now = new Date();

    if (period === "this_month") {
      // 4 weekly buckets for past 30 days
      const buckets = [
        { label: "W1", mins: 0, count: 0, names: [] as string[] },
        { label: "W2", mins: 0, count: 0, names: [] as string[] },
        { label: "W3", mins: 0, count: 0, names: [] as string[] },
        { label: "W4", mins: 0, count: 0, names: [] as string[] },
      ];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 28);

      completedWorkouts.forEach((w) => {
        const d = new Date(w.completedAt || w.startedAt);
        if (d >= thirtyDaysAgo) {
          const diffDays = Math.floor((d.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
          const bucketIndex = Math.min(3, Math.floor(diffDays / 7));
          const dur = w.duration
            ? Math.round(w.duration / 60)
            : Math.round((new Date(w.completedAt!).getTime() - new Date(w.startedAt).getTime()) / 60000);
          buckets[bucketIndex].mins += Math.max(1, dur);
          buckets[bucketIndex].count++;
          if (w.name) buckets[bucketIndex].names.push(w.name);
        }
      });

      const maxMins = Math.max(...buckets.map((b) => b.mins), 120);
      const totalMins = buckets.reduce((s, b) => s + b.mins, 0);
      const activeCount = buckets.filter((b) => b.count > 0).length;

      return {
        chartDays: buckets.map((b, idx) => ({
          day: b.label,
          fullDate: `Week ${idx + 1}`,
          value: b.mins > 0 ? Math.max(12, Math.round((b.mins / maxMins) * 100)) : 0,
          mins: b.mins,
          count: b.count,
          workoutNames: b.names.join(", "),
        })),
        totalDurationMins: totalMins,
        activeDaysCount: activeCount,
        periodLabel: "past 4 weeks",
      };
    }

    // Weekly view: Mon to Sun
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);

    if (period === "this_week") {
      startOfWeek.setDate(now.getDate() - dayOfWeek);
    } else {
      // last_week
      startOfWeek.setDate(now.getDate() - dayOfWeek - 7);
    }

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = dayLabels.map((dayName, idx) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + idx);
      const dateStr = targetDate.toLocaleDateString();

      const matchedWorkouts = completedWorkouts.filter((w) => {
        const d = new Date(w.completedAt || w.startedAt);
        return d.toLocaleDateString() === dateStr;
      });

      const mins = matchedWorkouts.reduce((acc, w) => {
        const dur = w.duration
          ? Math.round(w.duration / 60)
          : w.completedAt && w.startedAt
          ? Math.round((new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime()) / 60000)
          : 0;
        return acc + Math.max(1, dur);
      }, 0);

      const names = matchedWorkouts.map((w) => w.name).filter(Boolean);

      return {
        day: dayName,
        dateNum: targetDate.getDate(),
        fullDate: targetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        mins,
        count: matchedWorkouts.length,
        workoutNames: names.join(", "),
      };
    });

    const maxMins = Math.max(...days.map((d) => d.mins), 60);
    const totalMins = days.reduce((s, d) => s + d.mins, 0);
    const activeCount = days.filter((d) => d.count > 0).length;

    return {
      chartDays: days.map((d) => ({
        ...d,
        value: d.mins > 0 ? Math.max(14, Math.round((d.mins / maxMins) * 100)) : 0,
      })),
      totalDurationMins: totalMins,
      activeDaysCount: activeCount,
      periodLabel: period === "this_week" ? "this week" : "last week",
    };
  }, [completedWorkouts, period]);

  const durationStr = totalDurationMins >= 60
    ? `${(totalDurationMins / 60).toFixed(1)} hrs`
    : `${totalDurationMins} min`;

  return (
    <div className="activity-card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="section-header">
        <div>
          <h2>Training Activity</h2>
          <p>
            {activeDaysCount > 0
              ? `Active ${activeDaysCount} ${period === "this_month" ? "weeks" : "days"} (${durationStr}) in ${periodLabel}`
              : `No workouts logged yet in ${periodLabel}`}
          </p>
        </div>

        <select
          className="period-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
        >
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
          <option value="this_month">Past 30 Days</option>
        </select>
      </div>

      <div className="chart" style={{ position: "relative" }}>
        {chartDays.map((item, index) => {
          const isHovered = hoveredDay === index;
          const hasWorkout = item.mins > 0;

          return (
            <div
              className="chart-column"
              key={item.day}
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ position: "relative", cursor: hasWorkout ? "pointer" : "default" }}
            >
              {/* Tooltip on hover */}
              {isHovered && hasWorkout && (
                <div
                  style={{
                    position: "absolute",
                    bottom: `${item.value + 35}%`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#18221b",
                    border: "1px solid #b6f23a",
                    color: "#f1f5f9",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    zIndex: 100,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.7)",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#b6f23a" }}>{item.mins} min</div>
                  <div style={{ fontSize: "10px", color: "#9aa49d", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.workoutNames || "Workout Session"}
                  </div>
                </div>
              )}

              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    height: `${item.value}%`,
                    backgroundColor: hasWorkout ? "#b6f23a" : "transparent",
                    boxShadow: isHovered && hasWorkout ? "0 0 12px rgba(182, 242, 58, 0.6)" : "none",
                  }}
                />
              </div>

              <div style={{ textAlign: "center", lineHeight: "1.2" }}>
                <span style={{ color: hasWorkout ? "#b6f23a" : "#69736c", fontWeight: hasWorkout ? 700 : 400 }}>
                  {item.day}
                </span>
                {"dateNum" in item && (
                  <div style={{ fontSize: "9px", color: "#505a52" }}>{(item as any).dateNum}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: "#727d75",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#b6f23a" }} />
          Completed Session
        </span>
        <span>Daily workout duration scaled</span>
      </div>
    </div>
  );
}