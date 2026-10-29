import { parseNumber } from "./number";

import type { Operator, ValueInput } from "@typedefs";

/** An incomplete condition (no value yet) never applies. */
export const isConditionValueComplete = (input: ValueInput, value: readonly string[]): boolean => {
  const needed = input === "range" ? 2 : 1;
  return value.length >= needed && value.slice(0, needed).every((item) => item.trim() !== "");
};

/** Text comparisons ignore case and surrounding spaces. */
const normalize = (text: string): string => text.trim().toLocaleLowerCase();

export const textOperators: readonly Operator<string>[] = [
  { id: "equals", label: "equals", input: "text", test: (answer, [text]) => normalize(answer) === normalize(text) },
  {
    id: "notEquals",
    label: "does not equal",
    input: "text",
    test: (answer, [text]) => normalize(answer) !== normalize(text),
  },
  {
    id: "contains",
    label: "contains",
    input: "text",
    test: (answer, [text]) => normalize(answer).includes(normalize(text)),
  },
];

/** Number answers are stored as typed text, so both sides are parsed before comparing. */
const compareNumbers = (answer: string, expected: string, check: (a: number, b: number) => boolean): boolean => {
  const a = parseNumber(answer);
  const b = parseNumber(expected);
  return a !== null && b !== null && check(a, b);
};

export const numberOperators: readonly Operator<string>[] = [
  {
    id: "equals",
    label: "equals",
    input: "number",
    test: (answer, [n]) => compareNumbers(answer, n, (a, b) => a === b),
  },
  {
    id: "greaterThan",
    label: "is greater than",
    input: "number",
    test: (answer, [n]) => compareNumbers(answer, n, (a, b) => a > b),
  },
  {
    id: "lessThan",
    label: "is less than",
    input: "number",
    test: (answer, [n]) => compareNumbers(answer, n, (a, b) => a < b),
  },
  {
    id: "between",
    label: "is within range",
    input: "range",
    test: (answer, [from, to]) =>
      compareNumbers(answer, from, (a, b) => a >= b) && compareNumbers(answer, to, (a, b) => a <= b),
  },
];

// ISO dates (yyyy-mm-dd) sort correctly as plain strings.
export const dateOperators: readonly Operator<string>[] = [
  { id: "equals", label: "equals", input: "date", test: (answer, [date]) => answer === date },
  { id: "before", label: "is before", input: "date", test: (answer, [date]) => answer < date },
  { id: "after", label: "is after", input: "date", test: (answer, [date]) => answer > date },
];

export const singleOptionOperators: readonly Operator<string | null>[] = [
  { id: "equals", label: "equals", input: "option", test: (answer, [id]) => answer === id },
  { id: "notEquals", label: "does not equal", input: "option", test: (answer, [id]) => answer !== id },
];

export const multiOptionOperators: readonly Operator<string[]>[] = [
  {
    id: "containsAny",
    label: "contains any of",
    input: "options",
    test: (answer, ids) => ids.some((id) => answer.includes(id)),
  },
  {
    id: "containsAll",
    label: "contains all of",
    input: "options",
    test: (answer, ids) => ids.every((id) => answer.includes(id)),
  },
  {
    id: "containsNone",
    label: "contains none of",
    input: "options",
    test: (answer, ids) => !ids.some((id) => answer.includes(id)),
  },
];
