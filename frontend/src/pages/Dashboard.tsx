import {
  ChartNoAxesCombined,
  Clock,
  Dumbbell,
  Trophy,
  Play,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import MobileNav from "../components/layout/MobileNav";
import StatCard from "../components/dashboard/StatCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentWorkout from "../components/dashboard/RecentWorkout";

export default function Dashboard() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Topbar />

        <main className="dashboard">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">YOUR FITNESS JOURNEY</p>

              <h1>
                Good morning, <span>Bhautik</span>
              </h1>

              <p className="welcome-text">
                Ready to make today's workout count?
              </p>
            </div>

            <button className="start-workout-button">
              <Play size={18} fill="currentColor" />
              Start Workout
            </button>
          </section>

          <section className="stats-grid">
            <StatCard
              title="WORKOUTS"
              value="24"
              subtitle="+12% from last month"
              icon={Dumbbell}
            />

            <StatCard
              title="TOTAL TIME"
              value="18h 42m"
              subtitle="This month"
              icon={Clock}
            />

            <StatCard
              title="PERSONAL RECORDS"
              value="8"
              subtitle="2 new this month"
              icon={Trophy}
            />

            <StatCard
              title="CONSISTENCY"
              value="86%"
              subtitle="+5% from last month"
              icon={ChartNoAxesCombined}
            />
          </section>

          <section className="dashboard-grid">
            <ActivityChart />
            <div className="goal-card">
              <div className="section-header">
                <div>
                  <h2>Weekly Goal</h2>
                  <p>Keep your momentum going</p>
                </div>

                <ArrowUpRight size={20} />
              </div>

              <div className="goal-circle">
                <div>
                  <strong>4</strong>
                  <span>/ 5</span>
                </div>
              </div>

              <p className="goal-text">
                One more workout to reach your weekly goal.
              </p>

              <div className="goal-progress">
                <div className="goal-progress-fill"></div>
              </div>
            </div>
          </section>

          <RecentWorkout />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}