import { Type } from "lucide-react";
import { InputAffix } from "@components/ui/InputAffix";
import { NumberSetting, SettingsRow, TextSetting } from "@components/settings/SettingInputs";
import { textOperators } from "@utils/operators";
import { pdfAnswer, readString, isBlank, validateLength } from "@utils/fieldHelpers";

import type { ConfigEditorProps, FieldDefinition, InputProps } from "@typedefs";

const TextInput = ({ field, value, onChange, inputId, describedBy, invalid, required }: InputProps<"text">) => {
  const { placeholder, maxLength, prefix, suffix } = field.config;
  return (
    <InputAffix prefix={prefix} suffix={suffix}>
      <input
        id={inputId}
        className="input"
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength ?? undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputAffix>
  );
};

const TextConfigEditor = ({ field, onChange }: ConfigEditorProps<"text">) => {
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
      <SettingsRow>
        <TextSetting
          label="Prefix"
          placeholder="https://"
          value={config.prefix}
          onChange={(prefix) => onChange({ ...config, prefix })}
        />
        <TextSetting
          label="Suffix"
          placeholder=".com"
          value={config.suffix}
          onChange={(suffix) => onChange({ ...config, suffix })}
        />
      </SettingsRow>
    </>
  );
};

export const textField: FieldDefinition<"text"> = {
  type: "text",
  name: "Single line text",
  description: "Short answers like names or links",
  icon: Type,
  kind: "input",
  defaultLabel: "Short answer",
  createConfig: () => ({ placeholder: "", minLength: null, maxLength: null, prefix: "", suffix: "" }),
  initialValue: () => "",
  readValue: readString,
  isEmpty: isBlank,
  validate: (value, field) => validateLength(value, field.config),
  toPdfBlock: (field, value) => {
    const { prefix, suffix } = field.config;
    return pdfAnswer(field.label, isBlank(value) ? [] : [`${prefix}${value.trim()}${suffix}`]);
  },
  operators: textOperators,
  ConfigEditor: TextConfigEditor,
  Input: TextInput,
};
