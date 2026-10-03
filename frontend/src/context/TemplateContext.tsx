import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Template } from "../types/template";
import { MOCK_TEMPLATES } from "../data/mockTemplates";

interface TemplateContextType {
  templates: Template[];
  getTemplate: (id: string) => Template | undefined;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "workout_hub_templates";

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse templates from local storage", e);
    }
    return MOCK_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const getTemplate = (id: string) => {
    return templates.find((t) => t.id === id);
  };

  const addTemplate = (template: Template) => {
    setTemplates((prev) => [template, ...prev]);
  };

  const updateTemplate = (updatedTemplate: Template) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        getTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplateProvider");
  }
  return context;
};
