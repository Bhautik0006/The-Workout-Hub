import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Exercise } from "../types/exercise";
import type { ExerciseProgressEntry } from "../types/exerciseProgress";
import { INITIAL_EXERCISES } from "../data/mockFullExercises";

interface ExerciseContextType {
  exercises: Exercise[];
  progressEntries: ExerciseProgressEntry[];
  getExercise: (id: string) => Exercise | undefined;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  addProgressEntry: (entry: ExerciseProgressEntry) => void;
  deleteProgressEntry: (id: string) => void;
  getProgressForExercise: (exerciseId: string) => ExerciseProgressEntry[];
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

const EXERCISES_STORAGE_KEY = "workout_hub_full_exercises";
const PROGRESS_STORAGE_KEY = "workout_hub_progress_entries";

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(EXERCISES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse exercises", e);
    }
    return INITIAL_EXERCISES;
  });

  const [progressEntries, setProgressEntries] = useState<ExerciseProgressEntry[]>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse progress entries", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(EXERCISES_STORAGE_KEY, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressEntries));
  }, [progressEntries]);

  const getExercise = (id: string) => exercises.find((e) => e.id === id);

  const addExercise = (exercise: Exercise) => {
    setExercises((prev) => [exercise, ...prev]);
  };

  const updateExercise = (updated: Exercise) => {
    setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const deleteExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    setProgressEntries((prev) => prev.filter((p) => p.exerciseId !== id));
  };

  const addProgressEntry = (entry: ExerciseProgressEntry) => {
    setProgressEntries((prev) => [entry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteProgressEntry = (id: string) => {
    setProgressEntries((prev) => prev.filter((p) => p.id !== id));
  };

  const getProgressForExercise = (exerciseId: string) => {
    return progressEntries.filter(p => p.exerciseId === exerciseId);
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        progressEntries,
        getExercise,
        addExercise,
        updateExercise,
        deleteExercise,
        addProgressEntry,
        deleteProgressEntry,
        getProgressForExercise,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercises = () => {
  const context = useContext(ExerciseContext);
  if (!context) throw new Error("useExercises must be used within an ExerciseProvider");
  return context;
};
