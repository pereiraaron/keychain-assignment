import { createId } from "./id";
import { getFieldDefinition, fieldRegistry } from "./fieldRegistry";

import type { ConfigOf, Field, FieldOf, FieldType, FormTemplate } from "@typedefs";

/** Safe cast: the helpers below only pair a config with its own field type. */
const asField = (field: FieldOf<FieldType>): Field => field as Field;

export const createBlankTemplate = (id: string): FormTemplate => {
  const now = new Date().toISOString();
  return { id, title: "Untitled form", description: "", fields: [], createdAt: now, updatedAt: now };
};

export const createField = (type: FieldType): Field => {
  const definition = fieldRegistry[type];
  return asField({
    id: createId(),
    type,
    label: definition.defaultLabel,
    required: false,
    config: definition.createConfig(),
    logic: { visible: true, match: "all", conditions: [] },
  });
};

export const setFieldConfig = (field: Field, config: ConfigOf<FieldType>): Field => asField({ ...field, config });

const pointsAt = (field: Field, fieldId: string): boolean =>
  field.logic.conditions.some((condition) => condition.targetId === fieldId) ||
  (getFieldDefinition(field).references?.(field) ?? []).includes(fieldId);

/** Fields whose conditions or settings use `fieldId`. */
export const fieldsUsing = (fields: readonly Field[], fieldId: string): Field[] =>
  fields.filter((field) => field.id !== fieldId && pointsAt(field, fieldId));

/** Deletes a field and every condition or setting that pointed at it. */
export const removeField = (fields: readonly Field[], fieldId: string): Field[] =>
  fields
    .filter((field) => field.id !== fieldId)
    .map((field) => {
      if (!pointsAt(field, fieldId)) {
        return field;
      }
      const conditions = field.logic.conditions.filter((condition) => condition.targetId !== fieldId);
      const updated: Field = { ...field, logic: { ...field.logic, conditions } };
      const { removeReference } = getFieldDefinition(updated);
      return removeReference ? setFieldConfig(updated, removeReference(updated.config, fieldId)) : updated;
    });
