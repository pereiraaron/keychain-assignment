import { Calculator } from "lucide-react";
import { SegmentedSetting, SelectSetting } from "@components/settings/SettingInputs";
import { formatNumber, roundTo } from "@utils/number";
import { pdfAnswer } from "@utils/fieldHelpers";

import type { Aggregation, Choice, ConfigEditorProps, Field, FieldDefinition, InputProps } from "@typedefs";

const aggregationChoices: readonly Choice<Aggregation>[] = [
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

const decimalChoices: readonly Choice<string>[] = [0, 1, 2, 3, 4].map((places) => ({
  value: String(places),
  label: String(places),
}));

const aggregate = (values: readonly number[], aggregation: Aggregation): number => {
  switch (aggregation) {
    case "sum":
      return values.reduce((total, value) => total + value, 0);
    case "average":
      return values.reduce((total, value) => total + value, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
  }
};

const numberFields = (fields: readonly Field[]): Field[] => fields.filter((field) => field.type === "number");

const CalculationOutput = ({ field, value, inputId, describedBy }: InputProps<"calculation">) => (
  <output id={inputId} className="input calc-output" aria-describedby={describedBy} aria-live="polite">
    {value === null ? <span className="muted">—</span> : formatNumber(value, field.config.decimals)}
  </output>
);

const CalculationConfigEditor = ({ field, fields, onChange }: ConfigEditorProps<"calculation">) => {
  const { config } = field;
  const candidates = numberFields(fields);
  return (
    <>
      <div className="setting">
        <div className="setting-label">Source fields</div>
        {candidates.length === 0 ? (
          <p className="setting-hint">Add a Number field to the form first.</p>
        ) : (
          <div className="check-list">
            {candidates.map((candidate) => (
              <label key={candidate.id} className="check-row">
                <input
                  type="checkbox"
                  checked={config.sources.includes(candidate.id)}
                  onChange={(event) =>
                    onChange({
                      ...config,
                      sources: event.target.checked
                        ? [...config.sources, candidate.id]
                        : config.sources.filter((id) => id !== candidate.id),
                    })
                  }
                />
                <span>{candidate.label || "Untitled number"}</span>
              </label>
            ))}
          </div>
        )}
        <p className="setting-hint">Hidden or empty sources are left out of the result.</p>
      </div>
      <SegmentedSetting
        label="Calculate"
        value={config.aggregation}
        options={aggregationChoices}
        onChange={(aggregation) => onChange({ ...config, aggregation })}
      />
      <SelectSetting
        label="Decimal places"
        value={String(config.decimals)}
        options={decimalChoices}
        onChange={(decimals) => onChange({ ...config, decimals: Number(decimals) })}
      />
    </>
  );
};

export const calculationField: FieldDefinition<"calculation"> = {
  type: "calculation",
  name: "Calculation",
  description: "Sum, average, min or max of numbers",
  icon: Calculator,
  kind: "computed",
  defaultLabel: "Total",
  createConfig: () => ({ sources: [], aggregation: "sum", decimals: 0 }),
  initialValue: () => null,
  readValue: (raw) => (typeof raw === "number" && Number.isFinite(raw) ? raw : null),
  isEmpty: (value) => value === null,
  compute: (field, context) => {
    const values = field.config.sources.map((id) => context.numberValue(id)).filter((value) => value !== null);
    return values.length === 0 ? null : roundTo(aggregate(values, field.config.aggregation), field.config.decimals);
  },
  toPdfBlock: (field, value) =>
    pdfAnswer(field.label, value === null ? [] : [formatNumber(value, field.config.decimals)]),
  configIssue: (field) =>
    field.config.sources.length === 0 ? "Choose at least one Number field to calculate from." : null,
  references: (field) => field.config.sources,
  removeReference: (config, fieldId) => ({ ...config, sources: config.sources.filter((id) => id !== fieldId) }),
  ConfigEditor: CalculationConfigEditor,
  Input: CalculationOutput,
};
