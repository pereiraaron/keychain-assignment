const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const longDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

const pad = (value: number): string => String(value).padStart(2, "0");

/** Today's date in the user's time zone, as yyyy-mm-dd (the format date inputs use). */
export const todayISO = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** "2026-10-28" -> "October 28, 2026". The time is added so the date isn't shifted by time zone. */
export const formatLongDate = (isoDate: string): string => longDateFormat.format(new Date(`${isoDate}T00:00`));

/** An ISO timestamp -> "Oct 28, 2026, 3:04 PM". */
export const formatDateTime = (iso: string): string => dateTimeFormat.format(new Date(iso));

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;
