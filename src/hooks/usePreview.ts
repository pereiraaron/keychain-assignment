import { useState } from "react";

/** State for the builder's preview modal. */
export const usePreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const openPreview = () => {
    setSubmitted(false);
    setIsOpen(true);
  };
  const closePreview = () => setIsOpen(false);
  const markSubmitted = () => setSubmitted(true);

  return { isOpen, submitted, openPreview, closePreview, markSubmitted };
};
