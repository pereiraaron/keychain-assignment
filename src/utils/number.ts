const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

/** Parses plain decimal input like "12", "-3.5" or ".25". Returns null for anything else. */
export const parseNumber = (raw: string): number | null => {
  const text = raw.trim();
  if (!NUMBER_PATTERN.test(text)) {
    return null;
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export const countDecimals = (raw: string): number => {
  const text = raw.trim();
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
};

export const roundTo = (value: number, decimals: number): number => Number(value.toFixed(decimals));

/** Formats with the user's locale. With `decimals`, always shows exactly that many places. */
export const formatNumber = (value: number, decimals: number | null = null): string =>
  new Intl.NumberFormat(
    undefined,
    decimals === null
      ? { maximumFractionDigits: 20 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
  ).format(value);
