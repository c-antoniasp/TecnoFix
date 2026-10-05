import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixDashboard from "./components/TecnoFixDashboard";
import TecnoFixProfile from "./components/TecnoFixProfile";
import { TecnoFixRegister } from "./components/TecnoFixRegister";
import { TecnoFixClientDashboard } from "./components/TecnoFixClientDashboard";
import TecnoFixRegisterTechnician from "./components/TecnoFixRegisterTechnician";
import { logout as apiLogout } from "./Api/auth";
import { ApiError } from "./Api/client";
import { registerTechnician } from "./Api/technician";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  TECHNICIAN: "Técnico",
  CLIENT: "Cliente",
};

function App() {
  // El token ya no se guarda en localStorage: vive en una cookie HttpOnly
  // que pone el backend, así que aquí solo recordamos los datos del usuario
  // mientras dura la pestaña (igual que en el proyecto de la Ayudantía).
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login"); // "login" | "register"
  const [view, setView] = useState("dashboard");
  const [loginNotice, setLoginNotice] = useState(null);
  const [techRegError, setTechRegError] = useState(null);
  const [techRegSuccess, setTechRegSuccess] = useState(null);

  const handleNavigate = (section) => {
    setTechRegError(null);
    setTechRegSuccess(null);
    if (section === "Mis datos") setView("profile");
    else if (section === "Técnicos") setView("registerTechnician");
    else setView("dashboard");
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Si falla el logout en el backend, igual cerramos la sesión en el front.
    }
    setUser(null);
    setAuthView("login");
    setView("dashboard");
    setLoginNotice(null);
  };

  // El endpoint elimina la cookie al cambiar la contraseña; sincronizamos la UI.
  const handleRequireLogin = (message, type) => {
    setLoginNotice({ message, type });
    setUser(null);
    setAuthView("login");
    setView("dashboard");
  };

  // Tras registrarse, el cliente entra directo a su dashboard (USU-002).
  const handleRegisterSuccess = (registeredEmail) => {
    setUser({
      userId: 0,
      name: registeredEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email: registeredEmail,
      role: "CLIENT",
    });
  };

  if (user === null) {
    if (authView === "register") {
      return (
        <TecnoFixRegister
          onBackToLogin={() => setAuthView("login")}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <TecnoFixLogin
        notice={loginNotice}
        onLoginSuccess={(authenticatedUser) => {
          setLoginNotice(null);
          setUser(authenticatedUser);
        }}
        onNavigateToRegister={() => {
          setLoginNotice(null);
          setAuthView("register");
        }}
      />
    );
  }

  // Registro de técnicos: solo el administrador (el backend exige rol ADMIN).
  const handleRegisterTechnician = async (name, email, specialty) => {
    try {
      const data = await registerTechnician({ name, email, specialty });
      setTechRegSuccess(data.message);
      setTechRegError(null);
      // Muestra el mensaje de éxito y vuelve al panel.
      setTimeout(() => handleNavigate("Resumen"), 1500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        handleRequireLogin("Su sesión expiró. Inicie sesión nuevamente.", "error");
        return;
      }
      setTechRegError(err instanceof Error ? err.message : "No se pudo conectar con el servidor");
      setTechRegSuccess(null);
    }
  };

  const role = ROLE_LABELS[user.role];

  if (view === "registerTechnician" && user.role === "ADMIN") {
    return (
      <TecnoFixRegisterTechnician
        onSubmit={handleRegisterTechnician}
        error={techRegError}
        successMessage={techRegSuccess}
        onBack={() => handleNavigate("Resumen")}
      />
    );
  }

  const profile = view === "profile" ? (
    <TecnoFixProfile
      user={user}
      role={role}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onPasswordChanged={(message) => handleRequireLogin(message, "success")}
      onSessionExpired={(message) => handleRequireLogin(message, "error")}
    />
  ) : null;

  if (user.role === "CLIENT") {
    return (
      <>
        {profile}
        {/* Conserva órdenes, filtros y decisiones al volver desde Mis datos. */}
        <div hidden={view === "profile"}>
          <TecnoFixClientDashboard
            user={{
              id: user.userId,
              nombre: user.name,
              email: user.email,
              rut: "",
              telefono: "",
              rol: role,
            }}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </div>
      </>
    );
  }

  if (profile) return profile;

  return (
    <TecnoFixDashboard
      userName={user.name}
      role={role}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}

export default App;
