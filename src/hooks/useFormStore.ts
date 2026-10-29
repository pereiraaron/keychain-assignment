import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { FormResponse, FormTemplate } from "@typedefs";

interface FormStore {
  templates: FormTemplate[];
  responses: FormResponse[];
  /** Adds a new template or replaces the saved one with the same id. */
  saveTemplate: (template: FormTemplate) => void;
  addResponse: (response: FormResponse) => void;
}

/** All app data, persisted to localStorage under "form-builder". */
export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      templates: [],
      responses: [],
      saveTemplate: (template) =>
        set((state) => ({
          templates: state.templates.some((item) => item.id === template.id)
            ? state.templates.map((item) => (item.id === template.id ? template : item))
            : [...state.templates, template],
        })),
      addResponse: (response) => set((state) => ({ responses: [...state.responses, response] })),
    }),
    { name: "form-builder" },
  ),
);
