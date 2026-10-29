import { Plus, Trash2 } from "lucide-react";
import { SegmentedSetting, SelectSetting, ToggleSetting } from "@components/settings/SettingInputs";
import { createCondition, eligibleTargets } from "@utils/formState";
import { getFieldDefinition } from "@utils/fieldRegistry";
import { ConditionValueEditor } from "./ConditionValueEditor";

import type { Choice, Condition, ConditionEffect, ConditionMatch, Field, FieldLogic } from "@typedefs";

const effectChoices: readonly Choice<ConditionEffect>[] = [
  { value: "show", label: "Show this field" },
  { value: "hide", label: "Hide this field" },
  { value: "require", label: "Mark as required" },
  { value: "unrequire", label: "Mark as not required" },
];

const matchChoices: readonly Choice<ConditionMatch>[] = [
  { value: "all", label: "All match" },
  { value: "any", label: "Any matches" },
];

interface ConditionEditorProps {
  condition: Condition;
  index: number;
  match: ConditionMatch;
  fields: readonly Field[];
  targets: readonly Field[];
  effects: readonly Choice<ConditionEffect>[];
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

const ConditionEditor = ({
  condition,
  index,
  match,
  fields,
  targets,
  effects,
  onChange,
  onRemove,
}: ConditionEditorProps) => {
  const target = fields.find((field) => field.id === condition.targetId);
  // Keep the current target listed even if no longer eligible.
  const choices = target && !targets.includes(target) ? [target, ...targets] : targets;
  const operators = target ? (getFieldDefinition(target).operators ?? []) : [];
  const operator = operators.find((candidate) => candidate.id === condition.operator);
  let lead = "If";
  if (index > 0) {
    lead = match === "all" ? "And if" : "Or if";
  }

  return (
    <li className="condition-card">
      <div className="condition-head">
        <span className="condition-lead">{lead}</span>
        <button type="button" className="icon-btn icon-btn-danger" aria-label="Remove condition" onClick={onRemove}>
          <Trash2 size={16} />
        </button>
      </div>
      <SelectSetting
        label="Field"
        placeholder="Select a field"
        value={target ? condition.targetId : ""}
        options={choices.map((field) => ({ value: field.id, label: field.label || getFieldDefinition(field).name }))}
        onChange={(targetId) => {
          const next = fields.find((field) => field.id === targetId);
          const created = next ? createCondition(next, condition.effect) : null;
          if (created) {
            onChange({ ...created, id: condition.id });
          }
        }}
      />
      {target && (
        <SelectSetting
          label="Comparison"
          value={operator ? condition.operator : ""}
          options={operators.map((candidate) => ({ value: candidate.id, label: candidate.label }))}
          onChange={(operatorId) => {
            const next = operators.find((candidate) => candidate.id === operatorId);
            if (next) {
              // Keep the value only if the new comparison uses the same kind of input.
              const value = next.input === operator?.input ? condition.value : [];
              onChange({ ...condition, operator: next.id, value });
            }
          }}
        />
      )}
      {target && operator && (
        <ConditionValueEditor
          input={operator.input}
          value={condition.value}
          options={getFieldDefinition(target).options?.(target) ?? []}
          onChange={(value) => onChange({ ...condition, value })}
        />
      )}
      <SelectSetting
        label="Then"
        value={condition.effect}
        options={effects}
        onChange={(effect) => onChange({ ...condition, effect })}
      />
    </li>
  );
};

interface LogicEditorProps {
  field: Field;
  fields: readonly Field[];
  onChange: (field: Field) => void;
}

export const FieldLogicEditor = ({ field, fields, onChange }: LogicEditorProps) => {
  const { logic } = field;
  const definition = getFieldDefinition(field);
  const takesInput = definition.kind === "input";
  const targets = eligibleTargets(fields, field);
  const effects = takesInput
    ? effectChoices
    : effectChoices.filter((choice) => choice.value === "show" || choice.value === "hide");

  const setLogic = (next: FieldLogic) => onChange({ ...field, logic: next });
  const setConditions = (conditions: Condition[]) => setLogic({ ...logic, conditions });

  const addCondition = () => {
    const target = targets.at(0);
    // A field hidden by default most likely needs a "show" rule, and the other way round.
    const condition = target ? createCondition(target, logic.visible ? "hide" : "show") : null;
    if (condition) {
      setConditions([...logic.conditions, condition]);
    }
  };

  return (
    <div className="settings-stack">
      <section className="settings-group">
        <h3 className="settings-heading">Default state</h3>
        <p className="setting-hint">
          Applies when no condition matches, or when the field a condition checks is empty or hidden.
        </p>
        <ToggleSetting
          label="Visible"
          checked={logic.visible}
          onChange={(visible) => setLogic({ ...logic, visible })}
        />
        {takesInput && (
          <ToggleSetting
            label="Required"
            checked={field.required}
            hint="Hidden fields are never required."
            onChange={(required) => onChange({ ...field, required })}
          />
        )}
      </section>

      <section className="settings-group">
        <h3 className="settings-heading">Conditions</h3>
        {logic.conditions.length > 1 && (
          <SegmentedSetting
            label="Apply an effect when"
            value={logic.match}
            options={matchChoices}
            hint="Conditions are grouped by effect. Hide wins over show, and required wins over not required."
            onChange={(match) => setLogic({ ...logic, match })}
          />
        )}
        {logic.conditions.length === 0 ? (
          <p className="setting-hint">No conditions. This field is always {logic.visible ? "shown" : "hidden"}.</p>
        ) : (
          <ol className="condition-list">
            {logic.conditions.map((condition, index) => (
              <ConditionEditor
                key={condition.id}
                condition={condition}
                index={index}
                match={logic.match}
                fields={fields}
                targets={targets}
                effects={effects}
                onChange={(next) =>
                  setConditions(logic.conditions.map((item) => (item.id === condition.id ? next : item)))
                }
                onRemove={() => setConditions(logic.conditions.filter((item) => item.id !== condition.id))}
              />
            ))}
          </ol>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={targets.length === 0}
          onClick={addCondition}
        >
          <Plus size={16} />
          Add condition
        </button>
        {targets.length === 0 && (
          <p className="setting-hint">
            Conditions check another field&apos;s answer. Add a text, number, date or choice field first.
          </p>
        )}
      </section>
    </div>
  );
};
