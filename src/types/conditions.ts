export type OperatorId =
  | "equals"
  | "notEquals"
  | "contains"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "before"
  | "after"
  | "containsAny"
  | "containsAll"
  | "containsNone";

/** Which input the builder shows for a condition's value. */
export type ValueInput = "text" | "number" | "range" | "date" | "option" | "options";

/** A comparison on a field's answer; `expected` is the condition's value list. */
export interface Operator<V> {
  id: OperatorId;
  label: string;
  input: ValueInput;
  test: (answer: V, expected: string[]) => boolean;
}

export type ConditionEffect = "show" | "hide" | "require" | "unrequire";

/** How conditions that share an effect combine. */
export type ConditionMatch = "all" | "any";

export interface Condition {
  id: string;
  /** The field whose answer is checked. Never the field that owns the condition. */
  targetId: string;
  operator: OperatorId;
  /** What to compare against. See `Operator`. */
  value: string[];
  effect: ConditionEffect;
}

export interface FieldLogic {
  /** Visibility when no condition applies. */
  visible: boolean;
  match: ConditionMatch;
  conditions: Condition[];
}
