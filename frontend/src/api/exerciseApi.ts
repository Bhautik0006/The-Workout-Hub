import { fetchWithAuth } from "./client";
import type { Exercise } from "../types/exercise";

export const exerciseApi = {
  getExercises: (): Promise<Exercise[]> => {
    return fetchWithAuth("/exercises");
  },

  createExercise: (data: Partial<Exercise>): Promise<Exercise> => {
    return fetchWithAuth("/exercises", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateExercise: (id: string, data: Partial<Exercise>): Promise<Exercise> => {
    return fetchWithAuth(`/exercises/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteExercise: (id: string): Promise<{ message: string }> => {
    return fetchWithAuth(`/exercises/${id}`, {
      method: "DELETE",
    });
  },
};
