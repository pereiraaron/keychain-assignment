import { Hash } from "lucide-react";
import { InputAffix } from "@components/ui/InputAffix";
import { NumberSetting, SelectSetting, SettingsRow, TextSetting } from "@components/settings/SettingInputs";
import { numberOperators } from "@utils/operators";
import { pluralize } from "@utils/format";
import { countDecimals, formatNumber, parseNumber } from "@utils/number";
import { pdfAnswer, readString, isBlank } from "@utils/fieldHelpers";

import type { Choice, ConfigEditorProps, FieldDefinition, InputProps } from "@typedefs";

const decimalChoices: readonly Choice<string>[] = [0, 1, 2, 3, 4].map((places) => ({
  value: String(places),
  label: places === 0 ? "0 (whole numbers)" : String(places),
}));

const NumberInput = ({ field, value, onChange, inputId, describedBy, invalid, required }: InputProps<"number">) => {
  const { prefix, suffix, decimals } = field.config;
  return (
    <InputAffix prefix={prefix} suffix={suffix}>
      <input
        id={inputId}
        className="input input-number"
        type="text"
        inputMode={decimals === 0 ? "numeric" : "decimal"}
        autoComplete="off"
        value={value}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputAffix>
  );
};

const NumberConfigEditor = ({ field, onChange }: ConfigEditorProps<"number">) => {
  const { config } = field;
  return (
    <>
      <SettingsRow>
        <NumberSetting label="Min value" value={config.min} onChange={(min) => onChange({ ...config, min })} />
        <NumberSetting label="Max value" value={config.max} onChange={(max) => onChange({ ...config, max })} />
      </SettingsRow>
      <SelectSetting
        label="Decimal places"
        value={String(config.decimals)}
        options={decimalChoices}
        onChange={(decimals) => onChange({ ...config, decimals: Number(decimals) })}
      />
      <SettingsRow>
        <TextSetting
          label="Prefix"
          placeholder="$"
          value={config.prefix}
          onChange={(prefix) => onChange({ ...config, prefix })}
        />
        <TextSetting
          label="Suffix"
          placeholder="kg"
          value={config.suffix}
          onChange={(suffix) => onChange({ ...config, suffix })}
        />
      </SettingsRow>
    </>
  );
};

export const numberField: FieldDefinition<"number"> = {
  type: "number",
  name: "Number",
  description: "Amounts, counts and measurements",
  icon: Hash,
  kind: "input",
  defaultLabel: "Number",
  createConfig: () => ({ min: null, max: null, decimals: 0, prefix: "", suffix: "" }),
  initialValue: () => "",
  readValue: readString,
  isEmpty: isBlank,
  validate: (value, field) => {
    const { min, max, decimals } = field.config;
    const number = parseNumber(value);
    if (number === null) {
      return "Enter a number, like 42 or 3.5.";
    }
    if (countDecimals(value) > decimals) {
      return decimals === 0 ? "Enter a whole number." : `Use at most ${pluralize(decimals, "decimal place")}.`;
    }
    if (min !== null && number < min) {
      return `Enter ${formatNumber(min)} or more.`;
    }
    if (max !== null && number > max) {
      return `Enter ${formatNumber(max)} or less.`;
    }
    return null;
  },
  toPdfBlock: (field, value) => {
    const { prefix, suffix, decimals } = field.config;
    const number = parseNumber(value);
    if (number === null) {
      return pdfAnswer(field.label, isBlank(value) ? [] : [value.trim()]);
    }
    return pdfAnswer(field.label, [`${prefix}${formatNumber(number, decimals)}${suffix}`]);
  },
  operators: numberOperators,
  ConfigEditor: NumberConfigEditor,
  Input: NumberInput,
};
