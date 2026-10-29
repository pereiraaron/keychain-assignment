import type { FieldLogic } from "./conditions";
import type {
  CalculationConfig,
  DateConfig,
  FileConfig,
  FileMeta,
  MultiSelectConfig,
  NumberConfig,
  SectionConfig,
  SingleSelectConfig,
  TextareaConfig,
  TextConfig,
} from "./fieldConfigs";

/** Each field type's settings (`config`) and answer (`value`). */
export interface FieldTypeMap {
  text: { config: TextConfig; value: string };
  textarea: { config: TextareaConfig; value: string };
  /** Kept as the text the user typed, so partial input ("1.") and decimal-place checks work. */
  number: { config: NumberConfig; value: string };
  /** ISO date (yyyy-mm-dd), or "" when empty. */
  date: { config: DateConfig; value: string };
  /** The selected option's id. */
  singleSelect: { config: SingleSelectConfig; value: string | null };
  /** Selected option ids, in option order. */
  multiSelect: { config: MultiSelectConfig; value: string[] };
  /** File details only; contents are never stored. */
  file: { config: FileConfig; value: FileMeta[] };
  /** Display only: captures nothing. */
  section: { config: SectionConfig; value: null };
  /** Computed from Number fields; never typed by the user. */
  calculation: { config: CalculationConfig; value: number | null };
}

export type FieldType = keyof FieldTypeMap;
export type ConfigOf<K extends FieldType> = FieldTypeMap[K]["config"];
export type ValueOf<K extends FieldType> = FieldTypeMap[K]["value"];
export type FieldValue = ValueOf<FieldType>;

/** Answers keyed by field id. A missing key means "no answer" (or, in a saved response, "hidden"). */
export type FormValues = Partial<Record<string, FieldValue>>;

export interface FieldOf<K extends FieldType> {
  id: string;
  type: K;
  /** The question text. For a Section Header, the heading text. */
  label: string;
  /** Required by default. Conditions can override it. Ignored by display and computed fields. */
  required: boolean;
  config: ConfigOf<K>;
  logic: FieldLogic;
}

/** A field of any type. Checking `field.type` narrows `field.config`. */
export type Field = { [K in FieldType]: FieldOf<K> }[FieldType];

export interface FormSnapshot {
  title: string;
  description: string;
  fields: Field[];
}

export interface FormTemplate extends FormSnapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  templateId: string;
  submittedAt: string;
  /** The template as it was when this response was submitted, so later edits don't change old PDFs. */
  snapshot: FormSnapshot;
  /** Only fields that were visible at submission. Hidden fields have no key at all. */
  answers: FormValues;
}
