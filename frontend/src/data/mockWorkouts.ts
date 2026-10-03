import type { Workout } from "../types/workout";

export const INITIAL_WORKOUTS: Workout[] = [
  {
    _id: "w_mock_1",
    user: "current_user",
    template: null,
    name: "Push Day Power",
    notes: "Felt strong today",
    status: "completed",
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    exercises: [
      {
        _id: "ex_mock_1",
        exercise: {
          id: "e1",
          name: "Barbell Bench Press",
          description: "A compound exercise that targets the chest, shoulders, and triceps.",
          muscleGroup: "Chest",
          equipment: "Barbell",
          media: [],
          isCustom: false,
          createdBy: null,
          createdAt: "",
          updatedAt: ""
        },
        sets: [
          { _id: "s1", weight: 135, reps: 10, completed: true },
          { _id: "s2", weight: 185, reps: 8, completed: true },
          { _id: "s3", weight: 205, reps: 5, completed: true }
        ]
      }
    ]
  }
];
