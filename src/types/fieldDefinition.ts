import type { Operator } from "./conditions";
import type { Option, SectionSize } from "./fieldConfigs";
import type { ConfigOf, Field, FieldOf, FieldType, FieldValue, ValueOf } from "./form";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

/** input: answered by the user; display: content only; computed: calculated. */
export type FieldKind = "input" | "display" | "computed";

export interface ComputeContext {
  /** The number in a visible Number field, or null if it is hidden, empty or not a number. */
  numberValue: (fieldId: string) => number | null;
}

/** One block of the PDF export. */
export type PdfBlock =
  | { kind: "heading"; text: string; size: SectionSize }
  | { kind: "answer"; label: string; lines: string[]; note?: string };

export interface InputProps<K extends FieldType> {
  field: FieldOf<K>;
  value: ValueOf<K>;
  onChange: (value: ValueOf<K>) => void;
  inputId: string;
  labelId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

export interface ConfigEditorProps<K extends FieldType> {
  field: FieldOf<K>;
  /** All fields in the form, for settings that point at other fields. */
  fields: readonly Field[];
  onChange: (config: ConfigOf<K>) => void;
}

/** Everything the app needs to know about one field type. Each field module exports one. */
export interface FieldDefinition<K extends FieldType> {
  readonly type: K;
  /** Name shown in the builder, e.g. "Single line text". */
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly kind: FieldKind;
  readonly defaultLabel: string;
  readonly createConfig: () => ConfigOf<K>;
  /** The value a new response starts with. `today` is an ISO date. */
  readonly initialValue: (field: FieldOf<K>, today: string) => ValueOf<K>;
  /** Turns a stored answer into this type's value (or the empty value if it doesn't fit). */
  readonly readValue: (raw: FieldValue | undefined, field: FieldOf<K>) => ValueOf<K>;
  readonly isEmpty: (value: ValueOf<K>) => boolean;
  /** Checks a non-empty answer. Required checks happen elsewhere. Returns an error message or null. */
  readonly validate?: (value: ValueOf<K>, field: FieldOf<K>) => string | null;
  readonly compute?: (field: FieldOf<K>, context: ComputeContext) => ValueOf<K>;
  /** Label for one control, or a group (radios, checkboxes). Default: control. */
  readonly labelTarget?: (field: FieldOf<K>) => "control" | "group";
  readonly toPdfBlock: (field: FieldOf<K>, value: ValueOf<K>) => PdfBlock;
  /** A settings problem that blocks saving, e.g. a select with no options. */
  readonly configIssue?: (field: FieldOf<K>) => string | null;
  /** Comparisons conditions can make on this field; none means it can't be targeted. */
  readonly operators?: readonly Operator<ValueOf<K>>[];
  readonly options?: (field: FieldOf<K>) => readonly Option[];
  /** Ids of other fields this field's settings point at (besides conditions). */
  readonly references?: (field: FieldOf<K>) => readonly string[];
  /** Drops a deleted field from this field's settings. */
  readonly removeReference?: (config: ConfigOf<K>, fieldId: string) => ConfigOf<K>;
  readonly ConfigEditor: ComponentType<ConfigEditorProps<K>>;
  readonly Input: ComponentType<InputProps<K>>;
}
