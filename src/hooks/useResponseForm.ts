import { useState } from "react";
import { initialValues, getFormState } from "@utils/formState";
import { validateAnswers } from "@utils/validation";
import { downloadPdf } from "@utils/pdfExport";
import { todayISO } from "@utils/format";

import type { FieldValue, FormSnapshot, FormValues } from "@typedefs";
import type { SyntheticEvent } from "react";

const focusField = (form: HTMLFormElement, fieldId: string) => {
  const item = form.querySelector<HTMLElement>(`[data-field-id="${CSS.escape(fieldId)}"]`);
  item?.scrollIntoView({ behavior: "smooth", block: "center" });
  item?.querySelector<HTMLElement>("input:not([disabled]), select, textarea, output")?.focus({ preventScroll: true });
};

/** Fill Mode state: values, live visibility/calculations and validation. */
export const useResponseForm = (snapshot: FormSnapshot, onSubmit: (answers: FormValues) => void) => {
  // Hidden fields keep their values but are never submitted.
  const [values, setValues] = useState<FormValues>(() => initialValues(snapshot.fields, todayISO()));
  const [showErrors, setShowErrors] = useState(false);
  const formState = getFormState(snapshot.fields, values);
  // After the first submit, errors update as the user types.
  const errors = showErrors ? validateAnswers(snapshot.fields, formState) : {};

  const setValue = (fieldId: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [fieldId]: value }));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateAnswers(snapshot.fields, formState);
    const firstInvalid = snapshot.fields.find((field) => found[field.id] !== undefined);
    if (firstInvalid) {
      setShowErrors(true);
      focusField(event.currentTarget, firstInvalid.id);
      return;
    }
    onSubmit(formState.answers);
  };

  const downloadDraft = () => {
    downloadPdf({ snapshot, answers: formState.answers, submittedAt: null, responseId: null });
  };

  const isRequired = (fieldId: string) => formState.states.get(fieldId)?.required ?? false;
  const visibleFields = snapshot.fields.filter((field) => formState.states.get(field.id)?.visible);
  const { answers } = formState;
  const errorCount = Object.keys(errors).length;

  return { visibleFields, answers, isRequired, errors, errorCount, setValue, handleSubmit, downloadDraft };
};
