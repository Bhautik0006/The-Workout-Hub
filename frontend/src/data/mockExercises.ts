import type { Exercise } from "../types/template";

export const MOCK_EXERCISES: Exercise[] = [
  { id: "e1", name: "Barbell Bench Press", targetMuscleGroup: "Chest", equipment: "Barbell", type: "strength" },
  { id: "e2", name: "Incline Dumbbell Press", targetMuscleGroup: "Chest", equipment: "Dumbbell", type: "strength" },
  { id: "e3", name: "Cable Crossover", targetMuscleGroup: "Chest", equipment: "Cable", type: "strength" },
  { id: "e4", name: "Lat Pulldown", targetMuscleGroup: "Back", equipment: "Cable", type: "strength" },
  { id: "e5", name: "Barbell Row", targetMuscleGroup: "Back", equipment: "Barbell", type: "strength" },
  { id: "e6", name: "Pull-up", targetMuscleGroup: "Back", equipment: "Bodyweight", type: "strength" },
  { id: "e7", name: "Overhead Press", targetMuscleGroup: "Shoulders", equipment: "Barbell", type: "strength" },
  { id: "e8", name: "Lateral Raise", targetMuscleGroup: "Shoulders", equipment: "Dumbbell", type: "strength" },
  { id: "e9", name: "Barbell Squat", targetMuscleGroup: "Legs", equipment: "Barbell", type: "strength" },
  { id: "e10", name: "Leg Press", targetMuscleGroup: "Legs", equipment: "Machine", type: "strength" },
  { id: "e11", name: "Romanian Deadlift", targetMuscleGroup: "Legs", equipment: "Barbell", type: "strength" },
  { id: "e12", name: "Calf Raise", targetMuscleGroup: "Legs", equipment: "Machine", type: "strength" },
  { id: "e13", name: "Bicep Curl", targetMuscleGroup: "Arms", equipment: "Dumbbell", type: "strength" },
  { id: "e14", name: "Tricep Extension", targetMuscleGroup: "Arms", equipment: "Cable", type: "strength" },
  { id: "e15", name: "Treadmill Run", targetMuscleGroup: "Cardio", equipment: "Machine", type: "cardio" },
];
