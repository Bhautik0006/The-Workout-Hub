import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TemplatesPage from "./pages/TemplatesPage";
import TemplateDetailPage from "./pages/TemplateDetailPage";
import CreateTemplatePage from "./pages/CreateTemplatePage";
import ExercisesPage from "./pages/ExercisesPage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import { AuthProvider } from "./context/AuthContext";
import { TemplateProvider } from "./context/TemplateContext";
import { ExerciseProvider } from "./context/ExerciseContext";
import { WorkoutProvider } from "./context/WorkoutContext";
import { AchievementProvider } from "./context/AchievementContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ActiveWorkoutToast from "./components/ActiveWorkoutToast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExerciseProvider>
          <TemplateProvider>
            <WorkoutProvider>
              <AchievementProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
                  <Route path="/templates/new" element={<ProtectedRoute><CreateTemplatePage /></ProtectedRoute>} />
                  <Route path="/templates/:id" element={<ProtectedRoute><TemplateDetailPage /></ProtectedRoute>} />
                  <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
                  <Route path="/exercises/:id" element={<ProtectedRoute><ExerciseDetailPage /></ProtectedRoute>} />
                  <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
                  <Route path="/workouts/:id" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ActiveWorkoutToast />
              </AchievementProvider>
            </WorkoutProvider>
          </TemplateProvider>
        </ExerciseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;