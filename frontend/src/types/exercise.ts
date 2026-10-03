export type ExerciseMedia = {
  type: "image" | "video";
  url: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  media: ExerciseMedia[];
  isCustom: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};
