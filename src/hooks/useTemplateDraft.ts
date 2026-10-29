import { useState } from "react";
import { createBlankTemplate, createField, fieldsUsing, removeField } from "@utils/templateFields";
import { findTemplateIssues } from "@utils/validation";
import { pluralize } from "@utils/format";
import { useFormStore } from "./useFormStore";
import { useTemplate } from "./useTemplates";

import type { Field, FieldType, FormTemplate } from "@typedefs";

const insertAt = <T>(items: readonly T[], index: number, item: T): T[] => [
  ...items.slice(0, index),
  item,
  ...items.slice(index),
];

/** The builder's draft template, kept local until `save`. */
export const useTemplateDraft = (templateId: string) => {
  const saved = useTemplate(templateId);
  const saveTemplate = useFormStore((state) => state.saveTemplate);
  const [draft, setDraft] = useState<FormTemplate>(() => saved ?? createBlankTemplate(templateId));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const issues = findTemplateIssues(draft);
  const selected = draft.fields.find((field) => field.id === selectedId);

  const update = (change: (template: FormTemplate) => FormTemplate) => {
    setDraft(change);
    setHasUnsavedChanges(true);
  };

  const updateFields = (change: (fields: Field[]) => Field[]) => {
    update((template) => ({ ...template, fields: change(template.fields) }));
  };

  /** Adds at `index`, or right after the selected field, or at the end. */
  const addField = (type: FieldType, index?: number) => {
    const field = createField(type);
    const selectedIndex = draft.fields.findIndex((item) => item.id === selectedId);
    const at = index ?? (selectedIndex === -1 ? draft.fields.length : selectedIndex + 1);
    updateFields((fields) => insertAt(fields, at, field));
    setSelectedId(field.id);
  };

  /** Moves a field so it lands before the field now at `index` (or at the end). */
  const moveField = (fieldId: string, index: number) => {
    updateFields((fields) => {
      const from = fields.findIndex((field) => field.id === fieldId);
      const to = index > from ? index - 1 : index;
      return from === -1 || to === from ? fields : insertAt(fields.toSpliced(from, 1), to, fields[from]);
    });
  };

  /** Deletes a field, asking first if other fields' conditions or calculations use it. */
  const deleteField = (fieldId: string) => {
    const field = draft.fields.find((item) => item.id === fieldId);
    const users = fieldsUsing(draft.fields, fieldId);
    if (field && users.length > 0) {
      const names = users.map((user) => `"${user.label}"`).join(", ");
      const message = `"${field.label}" is used by ${names}. Deleting it also removes the conditions and calculation sources that use it.`;
      if (!window.confirm(message)) {
        return;
      }
    }
    updateFields((fields) => removeField(fields, fieldId));
    if (selectedId === fieldId) {
      setSelectedId(null);
    }
  };

  const updateField = (next: Field) => {
    updateFields((fields) => fields.map((field) => (field.id === next.id ? next : field)));
  };

  /** Saves the draft. Returns an error message if there are issues to fix first. */
  const save = (): string | null => {
    if (issues.count > 0) {
      const first = draft.fields.find((field) => (issues.fields[field.id]?.length ?? 0) > 0);
      if (first) {
        setSelectedId(first.id);
      }
      return `Fix ${pluralize(issues.count, "issue")} before saving.`;
    }
    const now = new Date().toISOString();
    const next: FormTemplate = {
      ...draft,
      title: draft.title.trim(),
      createdAt: saved ? draft.createdAt : now,
      updatedAt: now,
    };
    saveTemplate(next);
    setDraft(next);
    setHasUnsavedChanges(false);
    return null;
  };

  const setTitle = (title: string) => update((template) => ({ ...template, title }));
  const setDescription = (description: string) => update((template) => ({ ...template, description }));

  return {
    draft,
    saved,
    hasUnsavedChanges,
    issues,
    selected,
    selectedId,
    setSelectedId,
    setTitle,
    setDescription,
    addField,
    moveField,
    deleteField,
    updateField,
    save,
  };
};
