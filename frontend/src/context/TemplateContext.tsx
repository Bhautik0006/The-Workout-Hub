import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { templateApi, type ApiTemplate } from "../api/templateApi";
import { useAuth } from "./AuthContext";

interface TemplateContextType {
  templates: ApiTemplate[];
  loading: boolean;
  error: string | null;
  getTemplate: (id: string) => ApiTemplate | undefined;
  createTemplate: (data: { name: string; description?: string; category?: string; exercises?: any[] }) => Promise<ApiTemplate>;
  updateTemplate: (id: string, data: Partial<ApiTemplate> | Record<string, any>) => Promise<ApiTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  addExerciseToTemplate: (templateId: string, data: { exercise: string; sets?: any[]; notes?: string; restSeconds?: number }) => Promise<ApiTemplate>;
  refetch: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [isAuthenticated]);

  const getTemplate = (id: string) =>
    templates.find((t) => t._id === id);

  const createTemplate = async (data: { name: string; description?: string; category?: string; exercises?: any[] }) => {
    const created = await templateApi.createTemplate(data);
    setTemplates((prev) => [created, ...prev]);
    return created;
  };

  const updateTemplate = async (id: string, data: Partial<ApiTemplate> | Record<string, any>) => {
    const updated = await templateApi.updateTemplate(id, data);
    setTemplates((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  };

  const deleteTemplate = async (id: string) => {
    await templateApi.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t._id !== id));
  };

  const addExerciseToTemplate = async (templateId: string, data: { exercise: string; sets?: any[]; notes?: string; restSeconds?: number }) => {
    const updated = await templateApi.addExercise(templateId, data);
    setTemplates((prev) => prev.map((t) => (t._id === templateId ? updated : t)));
    return updated;
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,
        error,
        getTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        addExerciseToTemplate,
        refetch: fetchTemplates,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (!context) throw new Error("useTemplates must be used within a TemplateProvider");
  return context;
};
