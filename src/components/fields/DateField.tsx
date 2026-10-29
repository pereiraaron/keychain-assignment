import { Calendar } from "lucide-react";
import { SettingsRow, TextSetting, ToggleSetting } from "@components/settings/SettingInputs";
import { dateOperators } from "@utils/operators";
import { formatLongDate } from "@utils/format";
import { pdfAnswer, readString } from "@utils/fieldHelpers";

import type { ConfigEditorProps, FieldDefinition, InputProps } from "@typedefs";

const DateInput = ({ field, value, onChange, inputId, describedBy, invalid, required }: InputProps<"date">) => (
  <input
    id={inputId}
    className="input input-date"
    type="date"
    value={value}
    min={field.config.minDate || undefined}
    max={field.config.maxDate || undefined}
    aria-invalid={invalid}
    aria-describedby={describedBy}
    aria-required={required}
    onChange={(event) => onChange(event.target.value)}
  />
);

const DateConfigEditor = ({ field, onChange }: ConfigEditorProps<"date">) => {
  const { config } = field;
  return (
    <>
      <ToggleSetting
        label="Pre-fill with today's date"
        hint="Filled in when a new response is started."
        checked={config.prefillToday}
        onChange={(prefillToday) => onChange({ ...config, prefillToday })}
      />
      <SettingsRow>
        <TextSetting
          label="Earliest date"
          type="date"
          value={config.minDate}
          onChange={(minDate) => onChange({ ...config, minDate })}
        />
        <TextSetting
          label="Latest date"
          type="date"
          value={config.maxDate}
          onChange={(maxDate) => onChange({ ...config, maxDate })}
        />
      </SettingsRow>
    </>
  );
};

export const dateField: FieldDefinition<"date"> = {
  type: "date",
  name: "Date",
  description: "A calendar date",
  icon: Calendar,
  kind: "input",
  defaultLabel: "Date",
  createConfig: () => ({ prefillToday: false, minDate: "", maxDate: "" }),
  initialValue: (field, today) => (field.config.prefillToday ? today : ""),
  readValue: readString,
  isEmpty: (value) => value === "",
  validate: (value, field) => {
    const { minDate, maxDate } = field.config;
    if (minDate !== "" && value < minDate) {
      return `Choose ${formatLongDate(minDate)} or later.`;
    }
    if (maxDate !== "" && value > maxDate) {
      return `Choose ${formatLongDate(maxDate)} or earlier.`;
    }
    return null;
  },
  toPdfBlock: (field, value) => pdfAnswer(field.label, value === "" ? [] : [formatLongDate(value)]),
  operators: dateOperators,
  ConfigEditor: DateConfigEditor,
  Input: DateInput,
};
