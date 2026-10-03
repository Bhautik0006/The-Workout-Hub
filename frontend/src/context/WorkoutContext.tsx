import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Workout, WorkoutSet } from "../types/workout";
import { INITIAL_WORKOUTS } from "../data/mockWorkouts";

interface WorkoutContextType {
  workouts: Workout[];
  getWorkout: (id: string) => Workout | undefined;
  startWorkout: (data: { name: string; template?: string; exercises?: any[] }) => Workout;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  updateSet: (workoutId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  completeWorkout: (id: string) => void;
  deleteWorkout: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);
const WORKOUTS_STORAGE_KEY = "workout_hub_workouts";

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    try {
      const saved = localStorage.getItem(WORKOUTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse workouts", e);
    }
    return INITIAL_WORKOUTS;
  });

  useEffect(() => {
    localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(workouts));
  }, [workouts]);

  const getWorkout = (id: string) => workouts.find(w => w._id === id);

  const startWorkout = (data: { name: string; template?: string; exercises?: any[] }) => {
    const newWorkout: Workout = {
      _id: `w_${Date.now()}`,
      user: "current_user",
      template: data.template || null,
      name: data.name,
      notes: "",
      status: "active",
      exercises: data.exercises || [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setWorkouts(prev => [newWorkout, ...prev]);
    return newWorkout;
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(prev => prev.map(w => w._id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w));
  };

  const updateSet = (workoutId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setWorkouts(prev => prev.map(w => {
      if (w._id !== workoutId) return w;
      const newExercises = w.exercises.map(ex => {
        const setIndex = ex.sets.findIndex(s => s._id === setId);
        if (setIndex >= 0) {
          const newSets = [...ex.sets];
          newSets[setIndex] = { ...newSets[setIndex], ...updates };
          return { ...ex, sets: newSets };
        }
        return ex;
      });
      return { ...w, exercises: newExercises, updatedAt: new Date().toISOString() };
    }));
  };

  const completeWorkout = (id: string) => {
    setWorkouts(prev => prev.map(w => w._id === id ? { ...w, status: "completed", completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : w));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w._id !== id));
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        getWorkout,
        startWorkout,
        updateWorkout,
        updateSet,
        completeWorkout,
        deleteWorkout,
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
