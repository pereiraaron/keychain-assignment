import { useEffect } from "react";
import { useBlocker } from "react-router";

const MESSAGE = "You have unsaved changes. Leave without saving?";

/** Asks before leaving the page while there are unsaved changes. */
export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") {
      return;
    }
    if (window.confirm(MESSAGE)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [hasUnsavedChanges]);
};
