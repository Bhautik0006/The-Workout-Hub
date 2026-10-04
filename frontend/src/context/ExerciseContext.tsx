import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Exercise } from "../types/exercise";
import { exerciseApi } from "../api/exerciseApi";
import { useAuth } from "./AuthContext";

interface ExerciseContextType {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  getExercise: (id: string) => Exercise | undefined;
  addExercise: (data: Partial<Exercise>) => Promise<void>;
  updateExercise: (id: string, data: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  refetch: () => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeExercise = (e: any): Exercise => ({
    id: e._id ?? e.id,
    name: e.name,
    description: e.description ?? "",
    muscleGroup: e.muscleGroup ?? "",
    equipment: e.equipment ?? "",
    media: e.media ?? [],
    isCustom: e.isCustom ?? false,
    createdBy: e.createdBy ?? null,
    createdAt: e.createdAt ?? new Date().toISOString(),
    updatedAt: e.updatedAt ?? new Date().toISOString(),
  });

  const fetchExercises = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseApi.getExercises();
      setExercises(data.map(normalizeExercise));
    } catch (err: any) {
      setError(err.message || "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [isAuthenticated]);

  const getExercise = (id: string) =>
    exercises.find((e) => e.id === id || (e as any)._id === id);

  const addExercise = async (data: Partial<Exercise>) => {
    const created = await exerciseApi.createExercise(data);
    setExercises((prev) => [normalizeExercise(created), ...prev]);
  };

  const updateExercise = async (id: string, data: Partial<Exercise>) => {
    const updated = await exerciseApi.updateExercise(id, data);
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? normalizeExercise(updated) : e))
    );
  };

  const deleteExercise = async (id: string) => {
    await exerciseApi.deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        loading,
        error,
        getExercise,
        addExercise,
        updateExercise,
        deleteExercise,
        refetch: fetchExercises,
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
