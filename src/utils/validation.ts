import { getFieldDefinition } from "./fieldRegistry";

import type { FormState } from "./formState";
import type { Field, FieldValue, FormSnapshot } from "@typedefs";

export type FieldErrors = Partial<Record<string, string>>;

const answerError = (field: Field, value: FieldValue | undefined, required: boolean): string | null => {
  const definition = getFieldDefinition(field);
  if (definition.kind !== "input") {
    return null;
  }
  const typed = definition.readValue(value, field);
  if (definition.isEmpty(typed)) {
    return required ? "This field is required." : null;
  }
  return definition.validate?.(typed, field) ?? null;
};

/** Checks visible fields only. Hidden fields are never validated. */
export const validateAnswers = (fields: readonly Field[], formState: FormState): FieldErrors => {
  const errors: FieldErrors = {};
  for (const field of fields) {
    const state = formState.states.get(field.id);
    if (!state?.visible) {
      continue;
    }
    const error = answerError(field, formState.answers[field.id], state.required);
    if (error !== null) {
      errors[field.id] = error;
    }
  }
  return errors;
};

export interface TemplateIssues {
  title: string | null;
  /** Problems by field id. */
  fields: Partial<Record<string, string[]>>;
  count: number;
}

/** Problems that block saving: a missing title or label, or a field type's own settings problem. */
export const findTemplateIssues = (snapshot: FormSnapshot): TemplateIssues => {
  const title = snapshot.title.trim() === "" ? "Give the form a title." : null;
  const fields: Partial<Record<string, string[]>> = {};
  let count = title === null ? 0 : 1;
  for (const field of snapshot.fields) {
    const issues = [
      field.label.trim() === "" ? "Add a label." : null,
      getFieldDefinition(field).configIssue?.(field) ?? null,
    ].filter((issue) => issue !== null);
    if (issues.length > 0) {
      fields[field.id] = issues;
      count += issues.length;
    }
  }
  return { title, fields, count };
};
