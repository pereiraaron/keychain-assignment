import { useState } from "react";

import type { ToastMessage, ToastTone } from "@typedefs";

/** A short message shown as a toast. A new id restarts the toast's animation. */
export const useToast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (tone: ToastTone, text: string) => setToast({ id: Date.now(), tone, text });
  const dismissToast = () => setToast(null);

  return { toast, showToast, dismissToast };
};
