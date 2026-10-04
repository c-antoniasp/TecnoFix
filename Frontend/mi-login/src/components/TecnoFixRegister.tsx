import { useState } from "react";
import type { FC, FormEvent, CSSProperties } from "react";

interface TecnoFixRegisterProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (email: string) => void;
}

export const TecnoFixRegister: FC<TecnoFixRegisterProps> = ({
  onBackToLogin,
  onRegisterSuccess,
}) => {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validaciones locales iniciales
    if (!nombre.trim()) {
      setErrorMessage("Debe completar el campo Nombre y apellidos");
      return;
    }
    if (!correo.trim()) {
      setErrorMessage("Debe completar el campo Correo electrónico");
      return;
    }
    if (!rut.trim()) {
      setErrorMessage("Debe completar el campo RUT");
      return;
    }
    if (!telefono.trim()) {
      setErrorMessage("Debe completar el campo Teléfono de contacto");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5032/api/cliente/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          rut: rut.trim(),
          telefono: telefono.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Error al procesar el registro.");
      } else {
        setSuccessMessage(data.message || "Cliente registrado exitosamente.");
        setTimeout(() => {
          onRegisterSuccess(correo);
        }, 2200);
      }
    } catch (err) {
      // Si la API no está alcanzable, permitimos feedback amigable
      setErrorMessage("No se pudo conectar con el servidor. Verifique que el Backend esté activo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.formSide}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width={20} height={20}>
                <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="#0F172A" strokeWidth={1.8} />
                <path d="M19.4 13.5a7.6 7.6 0 000-3l1.9-1.5-1.5-2.6-2.3.6a7.7 7.7 0 00-2.6-1.5L14.5 3h-3l-.4 2.5a7.7 7.7 0 00-2.6 1.5l-2.3-.6-1.5 2.6L6.6 10.5a7.6 7.6 0 000 3l-1.9 1.5 1.5 2.6 2.3-.6a7.7 7.7 0 002.6 1.5l.4 2.5h3l.4-2.5a7.7 7.7 0 002.6-1.5l2.3.6 1.5-2.6-1.9-1.5z" stroke="#0F172A" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </span>
            <span style={styles.brandName}>TecnoFix</span>
          </div>

          <h1 style={styles.title}>Crea tu cuenta</h1>
          <p style={styles.subtitle}>
            Regístrate para realizar seguimiento en línea a tus órdenes de reparación.
          </p>

          {errorMessage && (
            <div style={styles.errorBox}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={styles.successBox}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label htmlFor="nombre" style={styles.label}>
                Nombre y apellidos
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Ej. Juan Pérez González"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="correo" style={styles.label}>
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                placeholder="usuario@correo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.rowFields}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label htmlFor="rut" style={styles.label}>
                  RUT (sin puntos ni guion)
                </label>
                <input
                  id="rut"
                  type="text"
                  placeholder="Ej. 12345670K"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label htmlFor="telefono" style={styles.label}>
                  Teléfono de contacto
                </label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="+56912345678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.passwordNotice}>
              <span style={styles.passwordNoticeIcon}>ℹ️</span>
              <span>
                El sistema generará una contraseña temporal de 8 caracteres de forma aleatoria y te la enviará a tu correo electrónico.
              </span>
            </div>

            <button type="submit" disabled={loading} style={styles.btnPrimary}>
              {loading ? "Registrando..." : "Registrarme"}
            </button>
          </form>

          <p style={styles.loginLine}>
            ¿Ya tienes una cuenta?{" "}
            <button type="button" onClick={onBackToLogin} style={styles.loginLink}>
              Iniciar sesión
            </button>
          </p>
        </div>

        <div style={styles.welcomeSide}>
          <div style={{ ...styles.decorCircle, ...styles.decorCircle1 }} />
          <div style={{ ...styles.decorCircle, ...styles.decorCircle2 }} />

          <p style={styles.eyebrow}>Servicio Técnico Especializado</p>
          <h2 style={styles.welcomeTitle}>Transparencia y Calidad</h2>

          <p style={styles.welcomeText}>
            Podrás aprobar o rechazar presupuestos, ver el diagnóstico técnico y revisar cada etapa de la reparación de tus dispositivos en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  page: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #065F46 100%)",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 960,
    background: "#FFFFFF",
    borderRadius: 24,
    boxShadow: "0 30px 60px -20px rgba(15,23,42,0.45)",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    overflow: "hidden",
  },
  formSide: {
    padding: "44px 48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#34D399",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 6,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 1.5,
  },
  errorBox: {
    background: "#FEF2F2",
    color: "#f56558", // Color especificado en REQ NF01
    border: "1px solid #FECACA",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  successBox: {
    background: "#ECFDF5",
    color: "#059669",
    border: "1px solid #A7F3D0",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  rowFields: {
    display: "flex",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 13px",
    border: "1.5px solid #CBD5E1",
    borderRadius: 9,
    fontSize: 14,
    fontFamily: "inherit",
    background: "#FFFFFF",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  },
  passwordNotice: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    color: "#475569",
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 16,
    lineHeight: 1.4,
  },
  passwordNoticeIcon: {
    fontSize: 14,
    flexShrink: 0,
  },
  btnPrimary: {
    width: "100%",
    padding: 13,
    background: "#34D399",
    color: "#0F172A",
    border: "none",
    borderRadius: 9,
    fontSize: 14.5,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  loginLine: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
    color: "#64748B",
  },
  loginLink: {
    background: "none",
    border: "none",
    color: "#059669",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
    fontSize: "inherit",
    fontFamily: "inherit",
  },
  welcomeSide: {
    background: "#F1F5F9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    textAlign: "center",
    position: "relative",
    boxSizing: "border-box",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  decorCircle1: {
    width: 220,
    height: 220,
    top: -70,
    right: -60,
    background: "rgba(52,211,153,0.12)",
  },
  decorCircle2: {
    width: 160,
    height: 160,
    bottom: -50,
    left: -50,
    background: "rgba(15,23,42,0.06)",
  },
  eyebrow: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: 600,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#059669",
    letterSpacing: "-0.02em",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 13.5,
    color: "#475569",
    lineHeight: 1.6,
    maxWidth: 280,
  },
};
