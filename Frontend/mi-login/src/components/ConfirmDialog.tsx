import type { CSSProperties, FC, ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  // Texto de la pregunta, por ejemplo «¿Está seguro de registrarse?».
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Diálogo de confirmación «¿Está seguro?» exigido por la ERS (REQ NF01) antes de
// registrar, editar, habilitar o deshabilitar.
const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div
        style={styles.content}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="tf-confirm-title"
        aria-describedby="tf-confirm-text"
      >
        <h3 id="tf-confirm-title" style={styles.title}>¿Está seguro?</h3>
        <p id="tf-confirm-text" style={styles.text}>{message}</p>
        <div style={styles.buttons}>
          <button type="button" onClick={onCancel} style={styles.btnSecondary}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} style={styles.btnPrimary} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },
  content: {
    background: "#FFFFFF",
    padding: "32px",
    borderRadius: "16px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 12px 0",
  },
  text: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.5,
    margin: 0,
  },
  buttons: { display: "flex", gap: "12px", marginTop: "24px" },
  btnPrimary: {
    flex: 1,
    padding: 14,
    background: "#34D399",
    color: "#0F172A",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSecondary: {
    flex: 1,
    padding: 14,
    background: "#F1F5F9",
    color: "#64748B",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default ConfirmDialog;
