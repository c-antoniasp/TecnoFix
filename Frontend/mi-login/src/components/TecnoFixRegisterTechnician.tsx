import { useState, useEffect } from "react";
import type { FC, FormEvent } from "react";
import ConfirmDialog from "./ConfirmDialog";
import {
  VALIDATION_MESSAGES,
  isValidEmail,
  isValidPersonName,
  requiredFieldMessage,
} from "../utils/validation";

interface RegisterTechnicianProps {
  onSubmit: (name: string, email: string, specialty: string) => void;
  error: string | null;
  successMessage: string | null;
  onBack: () => void;
}

const TecnoFixRegisterTechnician: FC<RegisterTechnicianProps> = ({ onSubmit, error, successMessage, onBack }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");
  
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // Error de validación local (mismos textos de la ERS que devuelve el backend).
  const [validationError, setValidationError] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  
  useEffect(() => {
    if (error || successMessage) {
      setIsSubmitting(false);
    }
  }, [error, successMessage]);

  // Valida con las mismas reglas del backend (USU-003) antes de pedir confirmación.
  const validate = (): string => {
    if (!name.trim()) return requiredFieldMessage("Nombre y apellidos");
    if (!email.trim()) return requiredFieldMessage("Correo electrónico");
    if (!specialty.trim()) return requiredFieldMessage("Especialidad");
    if (!isValidPersonName(name.trim())) return VALIDATION_MESSAGES.invalidName;
    if (!isValidEmail(email.trim())) return VALIDATION_MESSAGES.invalidEmail;
    return "";
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const message = validate();
    setValidationError(message);
    if (!message) setShowConfirm(true);
  };

  const handleConfirm = (): void => {
    setShowConfirm(false); // Cierra el diálogo
    setIsSubmitting(true); // Cambia el texto del botón principal a "Registrando..."
    onSubmit(name.trim(), email.trim(), specialty.trim());
  };

  return (
    <div style={styles.page}>
      
      <ConfirmDialog
        open={showConfirm}
        message={
          <>
            ¿Está seguro de registrar a <strong>{name.trim()}</strong> como técnico?
          </>
        }
        confirmLabel="Sí, registrar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <div style={styles.card}>
        <div style={styles.formSide}>
          <h1 style={styles.title}>Registrar técnico</h1>
          <p style={styles.subtitle}>
            Ingresa los datos para habilitar a un nuevo técnico en el sistema.
          </p>

          {(validationError || error) && <div style={styles.errorMessage}>{validationError || error}</div>}
          {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>Nombre y apellidos</label>
              <div style={styles.inputWrap}>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#34D399"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#CBD5E1"; }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>Correo electrónico</label>
              <div style={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  placeholder="correo@tecnofix.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#34D399"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#CBD5E1"; }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label htmlFor="specialty" style={styles.label}>Especialidad</label>
              <div style={styles.inputWrap}>
                <input
                  id="specialty"
                  type="text"
                  placeholder="Ej. Reparación de Notebooks"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#34D399"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#CBD5E1"; }}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                type="button" 
                onClick={onBack} 
                style={styles.btnSecondary}
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  ...styles.btnPrimary,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Registrando técnico..." : "Registrar técnico"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #065F46 100%)",
    boxSizing: "border-box",
    position: "relative",
  },
  card: {
    width: "100%",
    maxWidth: 600,
    background: "#FFFFFF",
    borderRadius: 24,
    boxShadow: "0 30px 60px -20px rgba(15,23,42,0.45)",
    overflow: "hidden",
  },
  formSide: {
    padding: "56px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 10,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 1.5,
    marginBottom: 24,
  },
  errorMessage: {
    color: "#F56558",
    backgroundColor: "#FEE2E2",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  successMessage: {
    color: "#059669",
    backgroundColor: "#D1FAE5",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: 8,
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1.5px solid #CBD5E1",
    borderRadius: 10,
    fontSize: 14.5,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s ease",
  },
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
    transition: "all 0.2s ease"
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
  }
};

export default TecnoFixRegisterTechnician;