import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { TemplateProvider } from "./context/TemplateContext";
import { ExerciseProvider } from "./context/ExerciseContext";
import { WorkoutProvider } from "./context/WorkoutContext";

function App() {
  return (
    <WorkoutProvider>
      <ExerciseProvider>
        <TemplateProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/new" element={<CreateTemplatePage />} />
            <Route path="/templates/:id" element={<TemplateDetailPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/:id" element={<ActiveWorkoutPage />} />
          </Routes>
        </BrowserRouter>
      </TemplateProvider>
    </ExerciseProvider>
  </WorkoutProvider>
  );
}

export default App;