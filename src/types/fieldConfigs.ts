/** Builder settings for each field type. */

export interface Option {
  id: string;
  label: string;
}

export interface TextConfig {
  placeholder: string;
  minLength: number | null;
  maxLength: number | null;
  /** Shown before the input, e.g. "https://". */
  prefix: string;
  /** Shown after the input, e.g. ".com". */
  suffix: string;
}

export interface TextareaConfig {
  placeholder: string;
  minLength: number | null;
  maxLength: number | null;
  /** Visible rows. */
  rows: number;
}

export interface NumberConfig {
  min: number | null;
  max: number | null;
  /** Most decimal places allowed, 0–4. */
  decimals: number;
  prefix: string;
  suffix: string;
}

export interface DateConfig {
  /** Starts new responses with today's date. */
  prefillToday: boolean;
  /** ISO date, or "" for no limit. */
  minDate: string;
  maxDate: string;
}

export type SelectDisplay = "radio" | "dropdown" | "tiles";

export interface SingleSelectConfig {
  options: Option[];
  display: SelectDisplay;
}

export interface MultiSelectConfig {
  options: Option[];
  minSelections: number | null;
  maxSelections: number | null;
}

/** What we keep about an attached file. The contents are never read or stored. */
export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

export interface FileConfig {
  /** Comma-separated extensions or MIME types, e.g. ".pdf, .png, image/*". Empty allows any file. */
  accept: string;
  maxFiles: number;
}

export type SectionSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SectionConfig {
  size: SectionSize;
}

export type Aggregation = "sum" | "average" | "min" | "max";

export interface CalculationConfig {
  /** Ids of Number fields. Calculations can't use other calculations. */
  sources: string[];
  aggregation: Aggregation;
  decimals: number;
}
