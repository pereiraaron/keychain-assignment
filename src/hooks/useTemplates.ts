import { useFormStore } from "./useFormStore";

import type { FormTemplate } from "@typedefs";

/** All templates, last edited first, with the number of responses each has. */
export const useTemplates = () => {
  const allTemplates = useFormStore((state) => state.templates);
  const responses = useFormStore((state) => state.responses);

  const templates = allTemplates.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const responseCount = (templateId: string) =>
    responses.filter((response) => response.templateId === templateId).length;

  return { templates, responseCount };
};

/** One saved template, or undefined if it doesn't exist (yet). */
export const useTemplate = (templateId: string): FormTemplate | undefined => {
  const template = useFormStore((state) => state.templates.find((item) => item.id === templateId));
  return template;
};
