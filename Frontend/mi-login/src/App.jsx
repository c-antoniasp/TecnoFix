import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixDashboard, { DashboardLayout } from "./components/TecnoFixDashboard";
import TecnoFixProfile from "./components/TecnoFixProfile";
import { logout as apiLogout } from "./Api/auth";

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
  const [view, setView] = useState("dashboard");
  const [loginNotice, setLoginNotice] = useState(null);

  const handleNavigate = (section) => {
    setView(section === "Mis datos" ? "profile" : "dashboard");
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Si falla el logout en el backend, igual cerramos la sesión en el front.
    }
    setUser(null);
    setView("dashboard");
    setLoginNotice(null);
  };

  // El endpoint elimina la cookie al cambiar la contraseña; sincronizamos la UI.
  const handleRequireLogin = (message, type) => {
    setLoginNotice({ message, type });
    setUser(null);
    setView("dashboard");
  };

  if (user === null) {
    return (
      <TecnoFixLogin
        notice={loginNotice}
        onLoginSuccess={(authenticatedUser) => {
          setLoginNotice(null);
          setUser(authenticatedUser);
        }}
      />
    );
  }

  const role = ROLE_LABELS[user.role];

  if (view === "profile") {
    return (
      <TecnoFixProfile
        user={user}
        role={role}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onPasswordChanged={(message) => handleRequireLogin(message, "success")}
        onSessionExpired={(message) => handleRequireLogin(message, "error")}
      />
    );
  }

  if (user.role === "CLIENT") {
    return (
      <DashboardLayout
        active="Resumen"
        role={role}
        userName={user.name}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <p>El dashboard del cliente aún no está implementado.</p>
      </DashboardLayout>
    );
  }

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
