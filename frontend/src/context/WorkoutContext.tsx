import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import type { Workout, WorkoutSet } from "../types/workout";
import { workoutApi } from "../api/workoutApi";
import { useAuth } from "./AuthContext";

interface WorkoutContextType {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
  activeWorkout: Workout | undefined;
  getWorkout: (id: string) => Workout | undefined;
  startWorkout: (data: { name?: string; template?: string; exercises?: any[] }) => Promise<Workout>;
  updateWorkout: (id: string, updates: Partial<Workout> | Record<string, any>) => Promise<Workout>;
  syncLocalWorkout: (id: string, updates: Partial<Workout>) => void;
  updateSet: (workoutId: string, setId: string, updates: Partial<WorkoutSet>) => Promise<Workout>;
  completeWorkout: (id: string, data?: Partial<Workout> | Record<string, any>) => Promise<Workout>;
  deleteWorkout: (id: string) => Promise<void>;
  cancelActiveWorkout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    if (!isAuthenticated) {
      setWorkouts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await workoutApi.getWorkouts();
      setWorkouts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [isAuthenticated]);

  const activeWorkout = workouts.find((w) => w.status === "active");

  const workoutsRef = useRef(workouts);
  workoutsRef.current = workouts;

  const getWorkout = useCallback((id: string) => {
    return workoutsRef.current.find((w) => w._id === id);
  }, []);

  const syncLocalWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts((prev) => {
      const idx = prev.findIndex((w) => w._id === id);
      if (idx === -1) return prev;
      const current = prev[idx];

      // Quick check to skip re-render if data is identical
      if (
        current.name === updates.name &&
        current.volume === updates.volume &&
        current.notes === updates.notes
      ) {
        const curSets = current.exercises?.flatMap((e) => e.sets || []) || [];
        const updSets = (updates.exercises as any[])?.flatMap((e) => e.sets || []) || [];
        if (curSets.length === updSets.length) {
          let setsMatch = true;
          for (let i = 0; i < curSets.length; i++) {
            if (
              curSets[i].completed !== updSets[i].completed ||
              curSets[i].reps !== updSets[i].reps ||
              curSets[i].weight !== updSets[i].weight
            ) {
              setsMatch = false;
              break;
            }
          }
          if (setsMatch) return prev;
        }
      }

      const next = [...prev];
      next[idx] = { ...current, ...updates };
      return next;
    });
  }, []);

  const startWorkout = useCallback(
    async (data: { name?: string; template?: string; exercises?: any[] }) => {
      const newWorkout = await workoutApi.startWorkout(data);
      setWorkouts((prev) => [
        newWorkout,
        ...prev.map((w) => (w.status === "active" ? { ...w, status: "completed" as const } : w)),
      ]);
      return newWorkout;
    },
    []
  );

  const updateWorkout = useCallback(
    async (id: string, updates: Partial<Workout> | Record<string, any>) => {
      const updated = await workoutApi.updateWorkout(id, updates);
      setWorkouts((prev) => prev.map((w) => (w._id === id ? updated : w)));
      return updated;
    },
    []
  );

  const updateSet = useCallback(
    async (workoutId: string, setId: string, updates: Partial<WorkoutSet>) => {
      const updated = await workoutApi.updateSet(workoutId, setId, updates);
      setWorkouts((prev) => prev.map((w) => (w._id === workoutId ? updated : w)));
      return updated;
    },
    []
  );

  const completeWorkout = useCallback(
    async (id: string, data?: Partial<Workout> | Record<string, any>) => {
      const updated = await workoutApi.completeWorkout(id, data);
      setWorkouts((prev) => prev.map((w) => (w._id === id ? updated : w)));
      return updated;
    },
    []
  );

  const deleteWorkout = useCallback(async (id: string) => {
    await workoutApi.deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w._id !== id));
  }, []);

  const cancelActiveWorkout = useCallback(async () => {
    const active = workoutsRef.current.find((w) => w.status === "active");
    if (active) {
      try {
        localStorage.removeItem(`active_workout_draft_${active._id}`);
        await workoutApi.deleteWorkout(active._id);
      } catch (err) {
        console.warn("Failed to delete active workout:", err);
      } finally {
        setWorkouts((prev) => prev.filter((w) => w._id !== active._id));
      }
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        loading,
        error,
        activeWorkout,
        getWorkout,
        startWorkout,
        updateWorkout,
        syncLocalWorkout,
        updateSet,
        completeWorkout,
        deleteWorkout,
        cancelActiveWorkout,
        refetch: fetchWorkouts,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error("useWorkouts must be used within a WorkoutProvider");
  return context;
};
