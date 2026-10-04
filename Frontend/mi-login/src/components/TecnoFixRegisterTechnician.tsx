import { useState } from "react";
import type { FormEvent } from "react";

interface RegisterTechnicianProps {
  onSubmit: (name: string, email: string, specialty: string) => void;
  error: string | null;
  successMessage: string | null;
  onBack: () => void;
}

const TecnoFixRegisterTechnician = ({ onSubmit, error, successMessage, onBack }: RegisterTechnicianProps) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit(name, email, specialty);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.formSide}>
          <h1 style={styles.title}>Registrar Técnico</h1>
          <p style={styles.subtitle}>
            Ingresa los datos para habilitar a un nuevo técnico en el sistema.
          </p>

          {/* Mensajes de feedback */}
          {error && <div style={styles.errorMessage}>{error}</div>}
          {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

          <form onSubmit={handleSubmit}>
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
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="button" onClick={onBack} style={styles.btnSecondary}>
                Volver
              </button>
              <button type="submit" style={styles.btnPrimary}>
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Estilos adaptados de la paleta oficial
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
    color: "#F56558", // Color de error obligatorio NF01
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