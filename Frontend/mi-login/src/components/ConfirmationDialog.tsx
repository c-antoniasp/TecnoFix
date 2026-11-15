import { useEffect, useId, useRef } from "react";
import "./ConfirmationDialog.css";

interface ConfirmationDialogProps {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmationDialog({ open, message, onCancel, onConfirm }: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="tf-confirmationDialog"
      aria-labelledby={messageId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p id={messageId}>{message}</p>
      <div className="tf-confirmationActions">
        <button className="tf-button" type="button" onClick={onCancel}>Cancelar</button>
        <button className="tf-button tf-buttonPrimary" type="button" onClick={onConfirm}>Confirmar</button>
      </div>
    </dialog>
  );
}
