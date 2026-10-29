import { Check, CircleAlert, X } from "lucide-react";
import { classNames } from "@utils/classNames";

import type { ToastMessage } from "@typedefs";

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

/** Success toasts fade out on their own (CSS). Errors stay until dismissed. */
export const Toast = ({ toast, onDismiss }: ToastProps) => {
  if (!toast) {
    return null;
  }
  const error = toast.tone === "error";
  return (
    <div key={toast.id} className={classNames("toast", `toast-${toast.tone}`)} role={error ? "alert" : "status"}>
      {error ? <CircleAlert size={16} /> : <Check size={16} />}
      {toast.text}
      <button type="button" className="icon-btn" aria-label="Dismiss" onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  );
};
