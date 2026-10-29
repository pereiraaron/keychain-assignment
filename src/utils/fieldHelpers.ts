import { pluralize } from "@utils/format";

import type { PdfBlock, FieldValue, Option } from "@typedefs";

export const pdfAnswer = (label: string, lines: string[], note?: string): PdfBlock => ({
  kind: "answer",
  label,
  lines,
  note,
});

export const readString = (raw: FieldValue | undefined): string => (typeof raw === "string" ? raw : "");

export const isBlank = (value: string): boolean => value.trim() === "";

export interface LengthLimits {
  minLength: number | null;
  maxLength: number | null;
}

export const validateLength = (value: string, { minLength, maxLength }: LengthLimits): string | null => {
  const length = value.trim().length;
  if (minLength !== null && length < minLength) {
    return `Enter at least ${pluralize(minLength, "character")}.`;
  }
  if (maxLength !== null && length > maxLength) {
    return `Enter no more than ${pluralize(maxLength, "character")}.`;
  }
  return null;
};

/** Keeps only ids that still match an option, in option order. */
export const readOptionIds = (raw: FieldValue | undefined, options: readonly Option[]): string[] => {
  const items: readonly unknown[] = Array.isArray(raw) ? raw : [];
  return options.filter((option) => items.includes(option.id)).map((option) => option.id);
};

export const optionLabel = (options: readonly Option[], id: string): string =>
  options.find((option) => option.id === id)?.label ?? "";
