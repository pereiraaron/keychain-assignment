import { calculationField } from "@components/fields/CalculationField";
import { dateField } from "@components/fields/DateField";
import { fileField } from "@components/fields/FileField";
import { multiSelectField } from "@components/fields/MultiSelectField";
import { numberField } from "@components/fields/NumberField";
import { sectionField } from "@components/fields/SectionField";
import { singleSelectField } from "@components/fields/SingleSelectField";
import { textField } from "@components/fields/TextField";
import { textareaField } from "@components/fields/TextareaField";

import type { FieldDefinition, FieldType } from "@typedefs";

type FieldRegistry = { readonly [K in FieldType]: FieldDefinition<K> };

export const fieldRegistry: FieldRegistry = {
  text: textField,
  textarea: textareaField,
  number: numberField,
  date: dateField,
  singleSelect: singleSelectField,
  multiSelect: multiSelectField,
  file: fileField,
  section: sectionField,
  calculation: calculationField,
};

/** Order of the builder's field list. */
export const fieldTypeOrder = Object.keys(fieldRegistry) as FieldType[];

export const isFieldType = (value: unknown): value is FieldType =>
  typeof value === "string" && Object.hasOwn(fieldRegistry, value);

export const getFieldDefinition = <K extends FieldType>(field: { type: K }): FieldDefinition<K> =>
  fieldRegistry[field.type];
