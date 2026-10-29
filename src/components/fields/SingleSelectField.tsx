import { CircleDot } from "lucide-react";
import { SegmentedSetting } from "@components/settings/SettingInputs";
import { singleOptionOperators } from "@utils/operators";
import { classNames } from "@utils/classNames";
import { pdfAnswer, optionLabel } from "@utils/fieldHelpers";
import { createOptions, OptionsEditor } from "@components/settings/OptionsEditor";

import type { Choice, ConfigEditorProps, FieldDefinition, InputProps, SelectDisplay } from "@typedefs";

const displayChoices: readonly Choice<SelectDisplay>[] = [
  { value: "radio", label: "Radio" },
  { value: "dropdown", label: "Dropdown" },
  { value: "tiles", label: "Tiles" },
];

/** All three displays share one value and validation; Radio and Tiles are both radio inputs. */
const SingleSelectInput = ({
  field,
  value,
  onChange,
  inputId,
  labelId,
  describedBy,
  invalid,
  required,
}: InputProps<"singleSelect">) => {
  const { options, display } = field.config;

  if (options.length === 0) {
    return <p className="muted">No options yet.</p>;
  }

  if (display === "dropdown") {
    return (
      <select
        id={inputId}
        className="input select"
        value={value ?? ""}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-required={required}
        onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const tiles = display === "tiles";
  return (
    <div>
      <div
        role="radiogroup"
        className={tiles ? "choice-tiles" : "choice-list"}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        aria-required={required}
      >
        {options.map((option) => (
          <label
            key={option.id}
            className={classNames("choice", tiles && "tile", value === option.id && "is-selected")}
          >
            <input
              type="radio"
              className={tiles ? "visually-hidden" : undefined}
              name={inputId}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const SingleSelectConfigEditor = ({ field, onChange }: ConfigEditorProps<"singleSelect">) => {
  const { config } = field;
  return (
    <>
      <SegmentedSetting
        label="Display as"
        value={config.display}
        options={displayChoices}
        onChange={(display) => onChange({ ...config, display })}
      />
      <OptionsEditor options={config.options} onChange={(options) => onChange({ ...config, options })} />
    </>
  );
};

export const singleSelectField: FieldDefinition<"singleSelect"> = {
  type: "singleSelect",
  name: "Single select",
  description: "Pick one option: radio, dropdown or tiles",
  icon: CircleDot,
  kind: "input",
  defaultLabel: "Choose one",
  createConfig: () => ({ options: createOptions("Option 1", "Option 2", "Option 3"), display: "radio" }),
  initialValue: () => null,
  readValue: (raw, field) =>
    typeof raw === "string" && field.config.options.some((option) => option.id === raw) ? raw : null,
  isEmpty: (value) => value === null,
  labelTarget: (field) => (field.config.display === "dropdown" ? "control" : "group"),
  toPdfBlock: (field, value) =>
    pdfAnswer(field.label, value === null ? [] : [optionLabel(field.config.options, value)]),
  configIssue: (field) => (field.config.options.length === 0 ? "Add at least one option." : null),
  operators: singleOptionOperators,
  options: (field) => field.config.options,
  ConfigEditor: SingleSelectConfigEditor,
  Input: SingleSelectInput,
};
