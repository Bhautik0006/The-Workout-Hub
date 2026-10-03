import type { Template } from "../types/template";

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Push Day",
    description: "Focus on chest, shoulders, and triceps with this comprehensive push routine.",
    category: "Chest",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    exercises: [
      { id: "ep1", exerciseId: "e1", sets: 4, reps: 8, weight: "135 lbs", restDuration: 120, notes: "Focus on slow eccentric" },
      { id: "ep2", exerciseId: "e2", sets: 3, reps: 10, weight: "50 lbs", restDuration: 90 },
      { id: "ep3", exerciseId: "e7", sets: 3, reps: 8, weight: "95 lbs", restDuration: 120 },
      { id: "ep4", exerciseId: "e8", sets: 4, reps: 15, weight: "20 lbs", restDuration: 60, notes: "Strict form" },
      { id: "ep5", exerciseId: "e14", sets: 3, reps: 12, weight: "40 lbs", restDuration: 60 },
    ]
  },
  {
    id: "t2",
    name: "Pull Day",
    description: "Build a wide and thick back along with strong biceps.",
    category: "Back",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      { id: "ep6", exerciseId: "e6", sets: 4, reps: "failure", restDuration: 90 },
      { id: "ep7", exerciseId: "e5", sets: 4, reps: 8, weight: "135 lbs", restDuration: 120 },
      { id: "ep8", exerciseId: "e4", sets: 3, reps: 12, weight: "120 lbs", restDuration: 90 },
      { id: "ep9", exerciseId: "e13", sets: 4, reps: 10, weight: "30 lbs", restDuration: 60 },
    ]
  },
  {
    id: "t3",
    name: "Leg Day",
    description: "Heavy compound movements for lower body strength and size.",
    category: "Legs",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    exercises: [
      { id: "ep10", exerciseId: "e9", sets: 4, reps: 5, weight: "225 lbs", restDuration: 180, notes: "Belt on last two sets" },
      { id: "ep11", exerciseId: "e11", sets: 3, reps: 8, weight: "185 lbs", restDuration: 120 },
      { id: "ep12", exerciseId: "e10", sets: 3, reps: 15, weight: "360 lbs", restDuration: 90 },
      { id: "ep13", exerciseId: "e12", sets: 4, reps: 20, weight: "100 lbs", restDuration: 60 },
    ]
  }
];
