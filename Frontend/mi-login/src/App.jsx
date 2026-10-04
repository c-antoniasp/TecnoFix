import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixDashboard from "./components/TecnoFixDashboard";
import { TecnoFixRegister } from "./components/TecnoFixRegister";
import { TecnoFixClientDashboard } from "./components/TecnoFixClientDashboard";
import { logout as apiLogout } from "./Api/auth";

function App() {
  // El token ya no se guarda en localStorage: vive en una cookie HttpOnly
  // que pone el backend, así que aquí solo recordamos los datos del usuario
  // mientras dura la pestaña (igual que en el proyecto de la Ayudantía).
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login"); // "login" | "register"

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Si falla el logout en el backend, igual cerramos la sesión en el front.
    }
    setUser(null);
    setCurrentView("login");
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
    if (currentView === "register") {
      return (
        <TecnoFixRegister
          onBackToLogin={() => setCurrentView("login")}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
    return (
      <TecnoFixLogin
        onLoginSuccess={setUser}
        onNavigateToRegister={() => setCurrentView("register")}
      />
    );
  }

  if (user.role === "CLIENT") {
    return (
      <TecnoFixClientDashboard
        user={{
          id: user.userId,
          nombre: user.name,
          email: user.email,
          rut: "",
          telefono: "",
          rol: "Cliente",
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <TecnoFixDashboard
      userName={user.name}
      role={user.role === "ADMIN" ? "Administrador" : "Técnico"}
      onLogout={handleLogout}
    />
  );
}

export default App;
