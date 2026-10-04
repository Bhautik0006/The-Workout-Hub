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

export type WorkoutExerciseItem = {
  _id: string;
  id?: string;
  name: string;
  muscleGroup?: string;
  targetMuscleGroup?: string;
  equipment?: string;
  description?: string;
};

export type WorkoutExercise = {
  _id?: string;
  exercise: WorkoutExerciseItem | string;
  sets: WorkoutSet[];
  notes?: string;
};

export type WorkoutMedia = {
  type: "image" | "video";
  url: string;
};

export type Workout = {
  _id: string;
  user: string;
  template: Template | string | null;
  name: string;
  notes: string;
  status: "active" | "completed";
  duration?: number;
  volume?: number;
  media?: WorkoutMedia[];
  exercises: WorkoutExercise[];
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
