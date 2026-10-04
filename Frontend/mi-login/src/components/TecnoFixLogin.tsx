import { useEffect, useState } from "react";
import type { CSSProperties, FC, FormEvent } from "react";
import { login } from "../Api/auth";
import type { LoginResponse } from "../Api/auth";

interface TecnoFixLoginProps {
  // Se llama cuando el login en el backend fue exitoso.
  onLoginSuccess?: (user: LoginResponse) => void;
  notice?: { message: string; type: "success" | "error" } | null;
}
const TecnoFixLogin: FC<TecnoFixLoginProps> = ({ onLoginSuccess, notice }: TecnoFixLoginProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Quita el margen/borde blanco por defecto que pone el navegador en <body>
  useEffect(() => {
    const styleId = "tecnofix-global-reset";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
        }
        * {
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Carga la fuente Inter desde Google Fonts 
  useEffect(() => {
    const fontId = "tecnofix-inter-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Llama a POST /api/auth/login. El backend valida formato de correo,
      // campos vacíos y credenciales según la ERS (USU-001) y devuelve el
      // mensaje exacto a mostrar si algo falla.
      const user = await login({ email, password });
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LEFT: form */}
        <div style={styles.formSide}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width={20} height={20}>
                <path
                  d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
                  stroke="#0F172A"
                  strokeWidth={1.8}
                />
                <path
                  d="M19.4 13.5a7.6 7.6 0 000-3l1.9-1.5-1.5-2.6-2.3.6a7.7 7.7 0 00-2.6-1.5L14.5 3h-3l-.4 2.5a7.7 7.7 0 00-2.6 1.5l-2.3-.6-1.5 2.6L6.6 10.5a7.6 7.6 0 000 3l-1.9 1.5 1.5 2.6 2.3-.6a7.7 7.7 0 002.6 1.5l.4 2.5h3l.4-2.5a7.7 7.7 0 002.6-1.5l2.3.6 1.5-2.6-1.9-1.5z"
                  stroke="#0F172A"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span style={styles.brandName}>TecnoFix</span>
          </div>

          <h1 style={styles.title}>Inicia sesión</h1>
          <p style={styles.subtitle}>
            Ingresa con los datos que registraste para acceder a tu cuenta.
          </p>

          {notice && (
            <p
              role={notice.type === "success" ? "status" : "alert"}
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.5,
                color: notice.type === "success" ? "#065F46" : "#991B1B",
                background: notice.type === "success" ? "#D1FAE5" : "#FEE2E2",
              }}
            >
              {notice.message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Correo electrónico
              </label>
              <div style={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@correo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#34D399";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(52,211,153,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#CBD5E1";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Contraseña
              </label>
              <div style={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="mínimo 8 caracteres"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, paddingRight: 40 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#34D399";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(52,211,153,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#CBD5E1";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={styles.togglePass}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a3 3 0 004.24 4.24" />
                      <path d="M9.9 5.1A10.6 10.6 0 0112 5c7 0 10.5 7 10.5 7a13.2 13.2 0 01-3.1 4" />
                      <path d="M6.2 6.2C3.4 8 1.5 12 1.5 12s3.5 7 10.5 7c1.4 0 2.7-.3 3.8-.7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                      <circle cx={12} cy={12} r={3} />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p style={{ color: "#ef4444", fontSize: 14, margin: "8px 0" }}>
                  {error}
                    </p>
                    )}
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p style={styles.signupLine}>
            ¿No tienes una cuenta?{" "}
            <a href="#" style={styles.signupLink}>
              Crear cuenta
            </a>
          </p>
        </div>

        {/* RIGHT: welcome */}
        <div style={styles.welcomeSide}>
          <div style={{ ...styles.decorCircle, ...styles.decorCircle1 }} />
          <div style={{ ...styles.decorCircle, ...styles.decorCircle2 }} />

          <p style={styles.eyebrow}>Qué bueno verte de nuevo</p>
          <h2 style={styles.welcomeTitle}>Bienvenido de vuelta</h2>

          <div style={styles.illustration}>
            <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" width="100%">
              <ellipse cx={160} cy={200} rx={120} ry={14} fill="#E2E8F0" />
              <rect x={40} y={90} width={70} height={100} rx={6} fill="#1E293B" />
              <rect x={50} y={102} width={50} height={8} rx={2} fill="#34D399" />
              <rect x={50} y={118} width={50} height={8} rx={2} fill="#475569" />
              <rect x={50} y={134} width={50} height={8} rx={2} fill="#475569" />
              <rect x={50} y={150} width={50} height={8} rx={2} fill="#34D399" />
              <circle cx={97} cy={170} r={4} fill="#34D399" />
              <rect x={140} y={120} width={130} height={80} rx={6} fill="#0F172A" />
              <rect x={148} y={128} width={114} height={56} rx={3} fill="#1E293B" />
              <rect x={185} y={140} width={40} height={6} rx={3} fill="#34D399" />
              <rect x={185} y={152} width={60} height={5} rx={2.5} fill="#94A3B8" />
              <rect x={185} y={162} width={50} height={5} rx={2.5} fill="#94A3B8" />
              <circle cx={205} cy={176} r={6} fill="#34D399" opacity={0.5} />
              <circle cx={270} cy={60} r={10} fill="#34D399" opacity={0.25} />
              <circle cx={30} cy={60} r={7} fill="#0F172A" opacity={0.12} />
              <circle cx={290} cy={140} r={6} fill="#34D399" opacity={0.3} />
            </svg>
          </div>

          <p style={styles.welcomeText}>
            Consulta tus órdenes de reparación y el estado de tus equipos en
            cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background:
      "linear-gradient(135deg, #0F172A 0%, #1E293B 45%, #065F46 100%)",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 1050,
    minHeight: 640,
    background: "#FFFFFF",
    borderRadius: 24,
    boxShadow: "0 30px 60px -20px rgba(15,23,42,0.45)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
  },
  formSide: {
    padding: "56px 56px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 44,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#34D399",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 10,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 1.5,
    marginBottom: 32,
    maxWidth: 340,
  },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1.5px solid #CBD5E1",
    borderRadius: 10,
    fontSize: 14.5,
    fontFamily: "inherit",
    background: "#FFFFFF",
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s ease, box-shadow .15s ease",
  },
  togglePass: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    padding: 2,
  },
  btnPrimary: {
    width: "100%",
    padding: 14,
    background: "#34D399",
    color: "#0F172A",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 8,
  },
  signupLine: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 13.5,
    color: "#94A3B8",
  },
  signupLink: {
    color: "#059669",
    fontWeight: 700,
    textDecoration: "none",
  },
  welcomeSide: {
    background: "#F1F5F9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
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
    background: "rgba(52,211,153,0.10)",
  },
  decorCircle2: {
    width: 160,
    height: 160,
    bottom: -50,
    left: -50,
    background: "rgba(15,23,42,0.05)",
  },
  eyebrow: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 6,
    position: "relative",
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "#059669",
    letterSpacing: "-0.02em",
    marginBottom: 36,
    position: "relative",
    zIndex: 1,
  },
  illustration: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 320,
  },
  welcomeText: {
    marginTop: 32,
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 1.6,
    maxWidth: 320,
    position: "relative",
    zIndex: 1,
  },
};

export default TecnoFixLogin;
