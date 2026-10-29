import { X } from "lucide-react";
import { useId } from "react";
import { classNames } from "@utils/classNames";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

/** Native <dialog> modal, rendered only while open. */
export const Modal = ({ open, title, onClose, children, wide = false }: ModalProps) => {
  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) {
          dialog.showModal();
        }
      }}
      className={classNames("modal", wide && "modal-wide")}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the dialog element itself is a click on the backdrop.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </dialog>
  );
};
