import { useState } from "react";
import { createId } from "@utils/id";
import { useFormStore } from "./useFormStore";

import type { FormResponse, FormTemplate, FormValues } from "@typedefs";

/** Saves responses to a template and keeps the latest one for the success screen. */
export const useResponseSubmission = (template: FormTemplate | undefined) => {
  const addResponse = useFormStore((state) => state.addResponse);
  const [submission, setSubmission] = useState<FormResponse | null>(null);

  const submit = (answers: FormValues) => {
    if (!template) {
      return;
    }
    const response: FormResponse = {
      id: createId(),
      templateId: template.id,
      submittedAt: new Date().toISOString(),
      // A copy of the template, so later edits don't change this response or its PDF.
      snapshot: { title: template.title, description: template.description, fields: template.fields },
      answers,
    };
    addResponse(response);
    setSubmission(response);
    window.scrollTo({ top: 0 });
  };

  // Clearing the submission brings back an empty form.
  const startOver = () => setSubmission(null);

  return { submission, submit, startOver };
};
