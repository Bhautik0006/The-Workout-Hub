export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"
  | "Full Body"
  | "Cardio";

export interface Exercise {
  id: string;
  name: string;
  targetMuscleGroup: MuscleGroup;
  equipment: string;
  type: "strength" | "cardio";
}

export interface ExercisePrescription {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number | string; // e.g., 10 or "10-12" or "failure"
  weight?: string;
  restDuration?: number; // in seconds
  notes?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: MuscleGroup | "Other";
  exercises: ExercisePrescription[];
  createdAt: string;
  updatedAt: string;
}
