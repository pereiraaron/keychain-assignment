import { SelectSetting, SettingsRow, TextSetting } from "@components/settings/SettingInputs";

import type { Option, ValueInput } from "@typedefs";

interface ConditionValueEditorProps {
  input: ValueInput;
  value: string[];
  /** Options of the field being checked, for choice fields. */
  options: readonly Option[];
  onChange: (value: string[]) => void;
}

/** The "value" part of a condition. The input shown depends on the comparison. */
export const ConditionValueEditor = ({ input, value, options, onChange }: ConditionValueEditorProps) => {
  const [first = "", second = ""] = value;

  switch (input) {
    case "text":
    case "number":
      return <TextSetting label="Value" value={first} onChange={(text) => onChange([text])} />;
    case "date":
      return <TextSetting label="Date" type="date" value={first} onChange={(date) => onChange([date])} />;
    case "range":
      return (
        <SettingsRow>
          <TextSetting label="From" value={first} onChange={(from) => onChange([from, second])} />
          <TextSetting label="To" value={second} onChange={(to) => onChange([first, to])} />
        </SettingsRow>
      );
    case "option":
      return (
        <SelectSetting
          label="Option"
          placeholder="Select an option"
          value={first}
          options={options.map((option) => ({ value: option.id, label: option.label }))}
          onChange={(id) => onChange([id])}
        />
      );
    case "options":
      return (
        <div className="setting">
          <div className="setting-label">Options</div>
          <div className="check-list">
            {options.map((option) => (
              <label key={option.id} className="check-row">
                <input
                  type="checkbox"
                  checked={value.includes(option.id)}
                  onChange={(event) =>
                    onChange(event.target.checked ? [...value, option.id] : value.filter((id) => id !== option.id))
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
  }
};
