import { useId } from "react";

import type { ReactNode } from "react";
import type { Choice } from "@typedefs";

/** Builder settings inputs, each wrapped in its <label>. */

interface SettingProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

const Setting = ({ label, hint, required = false, children }: SettingProps) => (
  <label className="setting">
    <span className="setting-label">
      {label}
      {required && (
        <span className="required-mark" aria-hidden="true">
          *
        </span>
      )}
    </span>
    {children}
    {hint !== undefined && <span className="setting-hint">{hint}</span>}
  </label>
);

export const SettingsRow = ({ children }: { children: ReactNode }) => <div className="settings-row">{children}</div>;

interface TextSettingProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "date";
}

export const TextSetting = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required,
  type = "text",
}: TextSettingProps) => (
  <Setting label={label} hint={hint} required={required}>
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      aria-required={required}
      onChange={(event) => onChange(event.target.value)}
    />
  </Setting>
);

interface NumberSettingProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  integer?: boolean;
  placeholder?: string;
  hint?: string;
}

/** An optional number: an empty input means null. */
export const NumberSetting = ({
  label,
  value,
  onChange,
  min,
  max,
  integer = false,
  placeholder = "None",
  hint,
}: NumberSettingProps) => (
  <Setting label={label} hint={hint}>
    <input
      className="input"
      type="number"
      step={integer ? 1 : "any"}
      min={min}
      max={max}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        const next = event.target.valueAsNumber;
        if (Number.isNaN(next)) {
          onChange(null);
        } else {
          onChange(integer ? Math.trunc(next) : next);
        }
      }}
    />
  </Setting>
);

interface SelectSettingProps<T extends string> {
  label: string;
  value: T | "";
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  hint?: string;
}

export const SelectSetting = <T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  hint,
}: SelectSettingProps<T>) => (
  <Setting label={label} hint={hint}>
    <select
      className="input select"
      value={value}
      onChange={(event) => {
        const choice = options.find((option) => option.value === event.target.value);
        if (choice) {
          onChange(choice.value);
        }
      }}
    >
      {value === "" && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Setting>
);

interface SegmentedSettingProps<T extends string> {
  label: string;
  value: T;
  options: readonly Choice<T>[];
  onChange: (value: T) => void;
  hint?: string;
}

/** A row of toggle buttons (radio inputs underneath) for a few short choices. */
export const SegmentedSetting = <T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: SegmentedSettingProps<T>) => {
  const name = useId();
  return (
    <fieldset className="setting">
      <legend className="setting-label">{label}</legend>
      <div className="segmented">
        {options.map((option) => (
          <label key={option.value} className="segment">
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {hint !== undefined && <p className="setting-hint">{hint}</p>}
    </fieldset>
  );
};

interface ToggleSettingProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const ToggleSetting = ({ label, checked, onChange, hint }: ToggleSettingProps) => (
  <label className="toggle-row">
    <span className="toggle-text">
      <span className="setting-label">{label}</span>
      {hint !== undefined && <span className="setting-hint">{hint}</span>}
    </span>
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true" />
    </span>
  </label>
);
