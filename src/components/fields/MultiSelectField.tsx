import { SquareCheck } from "lucide-react";
import { NumberSetting, SettingsRow } from "@components/settings/SettingInputs";
import { multiOptionOperators } from "@utils/operators";
import { classNames } from "@utils/classNames";
import { pluralize } from "@utils/format";
import { pdfAnswer, readOptionIds, optionLabel } from "@utils/fieldHelpers";
import { createOptions, OptionsEditor } from "@components/settings/OptionsEditor";

import type { ConfigEditorProps, FieldDefinition, InputProps } from "@typedefs";

const MultiSelectInput = ({
  field,
  value,
  onChange,
  labelId,
  describedBy,
  invalid,
  required,
}: InputProps<"multiSelect">) => {
  const { options, maxSelections } = field.config;
  const atLimit = maxSelections !== null && value.length >= maxSelections;

  if (options.length === 0) {
    return <p className="muted">No options yet.</p>;
  }

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...value, id] : value.filter((selected) => selected !== id);
    // Keep answers in option order so exports read the same way as the form.
    onChange(options.filter((option) => next.includes(option.id)).map((option) => option.id));
  };

  return (
    <div
      role="group"
      className="choice-list"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      aria-required={required}
    >
      {options.map((option) => {
        const checked = value.includes(option.id);
        const disabled = !checked && atLimit;
        return (
          <label key={option.id} className={classNames("choice", checked && "is-selected", disabled && "is-disabled")}>
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(event) => toggle(option.id, event.target.checked)}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};

const MultiSelectConfigEditor = ({ field, onChange }: ConfigEditorProps<"multiSelect">) => {
  const { config } = field;
  return (
    <>
      <OptionsEditor options={config.options} onChange={(options) => onChange({ ...config, options })} />
      <SettingsRow>
        <NumberSetting
          label="Min selections"
          integer
          min={1}
          value={config.minSelections}
          onChange={(minSelections) => onChange({ ...config, minSelections })}
        />
        <NumberSetting
          label="Max selections"
          integer
          min={1}
          value={config.maxSelections}
          onChange={(maxSelections) => onChange({ ...config, maxSelections })}
        />
      </SettingsRow>
    </>
  );
};

export const multiSelectField: FieldDefinition<"multiSelect"> = {
  type: "multiSelect",
  name: "Multi select",
  description: "Pick any number of options",
  icon: SquareCheck,
  kind: "input",
  defaultLabel: "Choose all that apply",
  createConfig: () => ({
    options: createOptions("Option 1", "Option 2", "Option 3"),
    minSelections: null,
    maxSelections: null,
  }),
  initialValue: () => [],
  readValue: (raw, field) => readOptionIds(raw, field.config.options),
  isEmpty: (value) => value.length === 0,
  validate: (value, field) => {
    const { minSelections, maxSelections } = field.config;
    if (minSelections !== null && value.length < minSelections) {
      return `Select at least ${pluralize(minSelections, "option")}.`;
    }
    if (maxSelections !== null && value.length > maxSelections) {
      return `Select no more than ${pluralize(maxSelections, "option")}.`;
    }
    return null;
  },
  labelTarget: () => "group",
  toPdfBlock: (field, value) =>
    pdfAnswer(
      field.label,
      value.map((id) => optionLabel(field.config.options, id)),
    ),
  configIssue: (field) => (field.config.options.length === 0 ? "Add at least one option." : null),
  operators: multiOptionOperators,
  options: (field) => field.config.options,
  ConfigEditor: MultiSelectConfigEditor,
  Input: MultiSelectInput,
};
