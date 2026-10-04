import { fetchWithAuth } from "./client";

export interface ApiTemplate {
  _id: string;
  user: string;
  name: string;
  description: string;
  category: string;
  exercises: ApiTemplateExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiTemplateExercise {
  _id: string;
  exercise: {
    _id: string;
    name: string;
    muscleGroup: string;
    equipment: string;
    description: string;
    isCustom: boolean;
  } | null;
  sets: ApiTemplateSet[];
  restSeconds?: number;
  notes?: string;
}

export interface ApiTemplateSet {
  _id?: string;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
  restSeconds?: number;
  notes?: string;
}

export const templateApi = {
  getTemplates: (): Promise<ApiTemplate[]> => {
    return fetchWithAuth("/templates");
  },

  getTemplate: (id: string): Promise<ApiTemplate> => {
    return fetchWithAuth(`/templates/${id}`);
  },

  createTemplate: (data: { name: string; description?: string; category?: string; exercises?: any[] }): Promise<ApiTemplate> => {
    return fetchWithAuth("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTemplate: (id: string, data: Partial<ApiTemplate> | Record<string, any>): Promise<ApiTemplate> => {
    return fetchWithAuth(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTemplate: (id: string): Promise<{ message: string }> => {
    return fetchWithAuth(`/templates/${id}`, {
      method: "DELETE",
    });
  },

  addExercise: (templateId: string, data: { exercise: string; sets?: ApiTemplateSet[]; notes?: string; restSeconds?: number }): Promise<ApiTemplate> => {
    return fetchWithAuth(`/templates/${templateId}/exercises`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  addSets: (templateId: string, exerciseId: string, setData: ApiTemplateSet): Promise<ApiTemplate> => {
    return fetchWithAuth(`/templates/${templateId}/exercises/${exerciseId}/sets`, {
      method: "POST",
      body: JSON.stringify(setData),
    });
  },
};
