import { fetchWithAuth } from "./client";

export interface Achievement {
  _id: string;
  user: string;
  type: "PR_1RM" | "PR_WEIGHT" | "PR_VOLUME" | "MILESTONE";
  title: string;
  description: string;
  exercise: {
    _id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    media?: Array<{ url: string; type: "image" | "video" }>;
  } | string;
  exerciseName: string;
  metric: "oneRepMax" | "weight" | "volume";
  value: number;
  previousValue: number;
  improvement: number;
  weight: number;
  reps: number;
  sourceWorkout?: {
    _id: string;
    name: string;
    status: string;
    completedAt?: string;
  } | string;
  date: string;
  viewed: boolean;
  createdAt: string;
}

export interface AchievementStats {
  total: number;
  unviewed: number;
  latest: Achievement | null;
  byExercise: Record<string, number>;
}

export interface PotentialPRResult {
  isPR: boolean;
  is1RMPR: boolean;
  isWeightPR: boolean;
  current1RM: number;
  prevMax1RM: number;
  prevMaxWeight: number;
  improvement1RM: number;
  improvementWeight: number;
}

export const achievementApi = {
  getAchievements: (params?: { exerciseId?: string; type?: string; limit?: number }): Promise<Achievement[]> => {
    const query = new URLSearchParams();
    if (params?.exerciseId) query.append("exerciseId", params.exerciseId);
    if (params?.type) query.append("type", params.type);
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return fetchWithAuth(`/achievements${qs ? `?${qs}` : ""}`);
  },

  getAchievementStats: (): Promise<AchievementStats> => {
    return fetchWithAuth("/achievements/stats");
  },

  markViewed: (id: string = "all"): Promise<any> => {
    return fetchWithAuth(`/achievements/${id}/view`, {
      method: "POST",
    });
  },

  checkPotentialPR: (data: { exerciseId: string; weight: number; reps: number }): Promise<PotentialPRResult> => {
    return fetchWithAuth("/achievements/check", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
