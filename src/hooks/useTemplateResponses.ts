import { useFormStore } from "./useFormStore";

import type { FormResponse } from "@typedefs";

/** Submitted responses for one template, newest first. */
export const useTemplateResponses = (templateId: string): FormResponse[] => {
  const allResponses = useFormStore((state) => state.responses);

  const responses = allResponses
    .filter((response) => response.templateId === templateId)
    .toSorted((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return responses;
};
