import { getFieldDefinition, fieldRegistry } from "./fieldRegistry";
import { createId } from "./id";
import { parseNumber } from "./number";
import { isConditionValueComplete } from "./operators";

import type {
  ComputeContext,
  Condition,
  ConditionEffect,
  Field,
  FieldOf,
  FieldType,
  FieldValue,
  FormValues,
} from "@typedefs";

export interface FieldState {
  visible: boolean;
  required: boolean;
}

export interface FormState {
  states: ReadonlyMap<string, FieldState>;
  /** Answers for visible fields only, with calculations filled in. This is what gets submitted. */
  answers: FormValues;
}

const conditionHolds = <K extends FieldType>(target: FieldOf<K>, value: FieldValue, condition: Condition): boolean => {
  const definition = getFieldDefinition(target);
  const answer = definition.readValue(value, target);
  const operator = definition.operators?.find((candidate) => candidate.id === condition.operator);
  // The spec's "default state": a condition on an empty field never applies.
  if (!operator || definition.isEmpty(answer) || !isConditionValueComplete(operator.input, condition.value)) {
    return false;
  }
  return operator.test(answer, condition.value);
};

/** Visibility, required state and submittable answers. Rules are in the README. */
export const getFormState = (fields: readonly Field[], raw: FormValues): FormState => {
  const byId = new Map(fields.map((field) => [field.id, field] as const));
  const visibility = new Map<string, boolean>();

  const valueOf = (field: Field): FieldValue => {
    const definition = getFieldDefinition(field);
    return definition.compute ? definition.compute(field, context) : definition.readValue(raw[field.id], field);
  };

  const holds = (condition: Condition): boolean => {
    const target = byId.get(condition.targetId);
    return target !== undefined && isVisible(target) && conditionHolds(target, valueOf(target), condition);
  };

  const fires = (field: Field, effect: ConditionEffect): boolean => {
    const group = field.logic.conditions.filter((condition) => condition.effect === effect);
    if (group.length === 0) {
      return false;
    }
    return field.logic.match === "all" ? group.every(holds) : group.some(holds);
  };

  const isVisible = (field: Field): boolean => {
    let visible = visibility.get(field.id);
    if (visible === undefined) {
      visible = fires(field, "hide") ? false : fires(field, "show") || field.logic.visible;
      visibility.set(field.id, visible);
    }
    return visible;
  };

  const isRequired = (field: Field): boolean => {
    if (getFieldDefinition(field).kind !== "input") {
      return false;
    }
    if (fires(field, "require")) {
      return true;
    }
    return fires(field, "unrequire") ? false : field.required;
  };

  const context: ComputeContext = {
    numberValue: (fieldId) => {
      const source = byId.get(fieldId);
      if (source?.type !== "number" || !isVisible(source)) {
        return null;
      }
      return parseNumber(fieldRegistry.number.readValue(raw[fieldId], source));
    },
  };

  const states = new Map<string, FieldState>();
  const answers: FormValues = {};
  for (const field of fields) {
    const visible = isVisible(field);
    // A hidden field is never required, whatever its settings say.
    states.set(field.id, { visible, required: visible && isRequired(field) });
    if (visible) {
      answers[field.id] = valueOf(field);
    }
  }
  return { states, answers };
};

/** True if `fromId`'s state depends, directly or through a chain of conditions, on `onId`. */
const dependsOn = (fields: readonly Field[], fromId: string, onId: string, seen = new Set<string>()): boolean => {
  if (fromId === onId) {
    return true;
  }
  if (seen.has(fromId)) {
    return false;
  }
  seen.add(fromId);
  const conditions = fields.find((field) => field.id === fromId)?.logic.conditions ?? [];
  return conditions.some((condition) => dependsOn(fields, condition.targetId, onId, seen));
};

/** Fields `field` can target without creating a loop (excludes itself). */
export const eligibleTargets = (fields: readonly Field[], field: Field): Field[] =>
  fields.filter(
    (target) => (getFieldDefinition(target).operators?.length ?? 0) > 0 && !dependsOn(fields, target.id, field.id),
  );

export const createCondition = (target: Field, effect: ConditionEffect): Condition | null => {
  const operator = getFieldDefinition(target).operators?.at(0);
  return operator ? { id: createId(), targetId: target.id, operator: operator.id, value: [], effect } : null;
};

export const initialValueFor = (field: Field, today: string): FieldValue =>
  getFieldDefinition(field).initialValue(field, today);

export const initialValues = (fields: readonly Field[], today: string): FormValues =>
  Object.fromEntries(fields.map((field) => [field.id, initialValueFor(field, today)]));
