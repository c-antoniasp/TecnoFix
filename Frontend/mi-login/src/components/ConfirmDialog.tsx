import { useEffect, useId, useRef } from "react";
import type { FC, ReactNode } from "react";
// @ts-ignore
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de doble confirmación para acciones irreversibles.
 * Se usa antes de abrir una orden y antes de registrar el presupuesto.
 */
const ConfirmDialog: FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="tf-confirmOverlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="tf-confirmDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2 id={titleId} className="tf-confirmTitle">
          {title}
        </h2>
        <p id={descriptionId} className="tf-confirmText">
          {message}
        </p>
        <p className="tf-confirmWarning">Esta acción no se puede deshacer.</p>

        <div className="tf-confirmActions">
          <button
            ref={cancelRef}
            type="button"
            className="tf-button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="tf-button tf-buttonPrimary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
