export const classNames = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter((part) => typeof part === "string" && part !== "").join(" ");
