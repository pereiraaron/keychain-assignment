import { AlignLeft } from "lucide-react";
import { NumberSetting, SettingsRow, TextSetting } from "@components/settings/SettingInputs";
import { textOperators } from "@utils/operators";
import { pdfAnswer, readString, isBlank, validateLength } from "@utils/fieldHelpers";

import type { ConfigEditorProps, FieldDefinition, InputProps } from "@typedefs";

const MIN_ROWS = 2;
const MAX_ROWS = 20;

const clampRows = (rows: number): number => Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.round(rows)));

const TextareaInput = ({ field, value, onChange, inputId, describedBy, invalid, required }: InputProps<"textarea">) => (
  <textarea
    id={inputId}
    className="input textarea"
    rows={clampRows(field.config.rows)}
    value={value}
    placeholder={field.config.placeholder}
    maxLength={field.config.maxLength ?? undefined}
    aria-invalid={invalid}
    aria-describedby={describedBy}
    aria-required={required}
    onChange={(event) => onChange(event.target.value)}
  />
);

const TextareaConfigEditor = ({ field, onChange }: ConfigEditorProps<"textarea">) => {
  const { config } = field;
  return (
    <>
      <TextSetting
        label="Placeholder"
        value={config.placeholder}
        onChange={(placeholder) => onChange({ ...config, placeholder })}
      />
      <SettingsRow>
        <NumberSetting
          label="Min length"
          integer
          min={0}
          value={config.minLength}
          onChange={(minLength) => onChange({ ...config, minLength })}
        />
        <NumberSetting
          label="Max length"
          integer
          min={1}
          value={config.maxLength}
          onChange={(maxLength) => onChange({ ...config, maxLength })}
        />
      </SettingsRow>
      <NumberSetting
        label="Visible rows"
        integer
        min={MIN_ROWS}
        max={MAX_ROWS}
        placeholder="4"
        value={config.rows}
        hint={`Between ${MIN_ROWS} and ${MAX_ROWS}.`}
        onChange={(rows) => onChange({ ...config, rows: clampRows(rows ?? 4) })}
      />
    </>
  );
};

export const textareaField: FieldDefinition<"textarea"> = {
  type: "textarea",
  name: "Multi-line text",
  description: "Longer answers over several lines",
  icon: AlignLeft,
  kind: "input",
  defaultLabel: "Long answer",
  createConfig: () => ({ placeholder: "", minLength: null, maxLength: null, rows: 4 }),
  initialValue: () => "",
  readValue: readString,
  isEmpty: isBlank,
  validate: (value, field) => validateLength(value, field.config),
  toPdfBlock: (field, value) => pdfAnswer(field.label, isBlank(value) ? [] : [value.trim()]),
  operators: textOperators,
  ConfigEditor: TextareaConfigEditor,
  Input: TextareaInput,
};
