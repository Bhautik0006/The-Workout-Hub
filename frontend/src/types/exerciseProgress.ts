export type ExerciseProgressEntry = {
  id: string;
  exerciseId: string;
  date: string;
  weight?: number;
  reps?: number;
  sets?: number;
  durationSeconds?: number;
  distance?: number;
  notes?: string;
  createdAt: string;
};
