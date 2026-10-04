import { fetchWithAuth } from "./client";

export interface ProgressRecord {
  _id: string;
  user: string;
  exercise: string | { _id: string; name: string; muscleGroup?: string; equipment?: string };
  weight: number;
  reps: number;
  oneRepMax: number;
  volume: number;
  distance?: number;
  duration?: number;
  sourceWorkout?: string | { _id: string; name: string; completedAt?: string; status?: string };
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressStats {
  totalRecords: number;
  maxWeight: number;
  maxReps: number;
  maxOneRepMax: number;
  totalVolume: number;
  first1RM: number;
  last1RM: number;
  improvementPct: number;
}

export const progressApi = {
  getProgress: (exerciseId: string): Promise<ProgressRecord[]> => {
    return fetchWithAuth(`/progress/${exerciseId}`);
  },

  getProgressStats: (exerciseId: string): Promise<ProgressStats> => {
    return fetchWithAuth(`/progress/${exerciseId}/stats`);
  },

  getProgressHistory: (exerciseId: string): Promise<ProgressRecord[]> => {
    return fetchWithAuth(`/progress/${exerciseId}/history`);
  },

  recordProgress: (data: {
    exercise: string;
    weight: number;
    reps: number;
    oneRepMax?: number;
    volume?: number;
    date?: string;
  }): Promise<ProgressRecord> => {
    return fetchWithAuth("/progress", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteProgress: (id: string): Promise<{ message: string }> => {
    return fetchWithAuth(`/progress/${id}`, {
      method: "DELETE",
    });
  },
};
