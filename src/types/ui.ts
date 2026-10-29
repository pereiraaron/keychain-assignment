/** One choice in a select or segmented control. */
export interface Choice<T extends string> {
  value: T;
  label: string;
}

export type ToastTone = "success" | "error";

export interface ToastMessage {
  /** Changes for every new message, so the toast animates again. */
  id: number;
  tone: ToastTone;
  text: string;
}
