import { fetchWithAuth } from "./client";
import type { Workout } from "../types/workout";

export const workoutApi = {
  getWorkouts: (status?: "active" | "completed"): Promise<Workout[]> => {
    return fetchWithAuth(`/workouts${status ? `?status=${status}` : ""}`);
  },

  getWorkout: (id: string): Promise<Workout> => {
    return fetchWithAuth(`/workouts/${id}`);
  },

  startWorkout: (data: { name?: string; template?: string; exercises?: any[] }): Promise<Workout> => {
    return fetchWithAuth("/workouts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateWorkout: (id: string, updates: Partial<Workout> | Record<string, any>): Promise<Workout> => {
    return fetchWithAuth(`/workouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  updateSet: (workoutId: string, setId: string, updates: any): Promise<Workout> => {
    return fetchWithAuth(`/workouts/${workoutId}/sets/${setId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  completeWorkout: (id: string, data?: Partial<Workout> | Record<string, any>): Promise<Workout> => {
    return fetchWithAuth(`/workouts/${id}/complete`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  deleteWorkout: (id: string): Promise<{ message: string }> => {
    return fetchWithAuth(`/workouts/${id}`, {
      method: "DELETE",
    });
  },
};
