import type { Exercise } from "./exercise";
import type { Template } from "./template";

export type WorkoutSet = {
  _id?: string;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
  restSeconds?: number;
  notes?: string;
  completed: boolean;
};

export type WorkoutExercise = {
  _id?: string;
  exercise: Exercise | string; // populated or ID
  sets: WorkoutSet[];
};

export type Workout = {
  _id: string;
  user: string;
  template: Template | string | null;
  name: string;
  notes: string;
  status: "active" | "completed";
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
