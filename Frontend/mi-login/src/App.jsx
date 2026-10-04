import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import { TecnoFixRegister } from "./components/TecnoFixRegister";
import { TecnoFixClientDashboard } from "./components/TecnoFixClientDashboard";

function App() {
  const [currentView, setCurrentView] = useState("login"); // "login" | "register" | "dashboard"
  const [activeUser, setActiveUser] = useState(null);

  const handleLogin = (email, password) => {
    // Si el usuario ingresa sus credenciales, accedemos al dashboard de cliente
    console.log("Login simulado exitoso:", email);
    setActiveUser({
      id: 1,
      nombre: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Juan Pérez",
      email: email,
      rut: "12345670K",
      telefono: "+56912345678",
      rol: "Cliente",
    });
    setCurrentView("dashboard");
  };

  const handleRegisterSuccess = (registeredEmail) => {
    setActiveUser({
      id: 2,
      nombre: registeredEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email: registeredEmail,
      rut: "12345670K",
      telefono: "+56912345678",
      rol: "Cliente",
    });
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentView("login");
  };

  if (currentView === "register") {
    return (
      <TecnoFixRegister
        onBackToLogin={() => setCurrentView("login")}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  if (currentView === "dashboard" && activeUser) {
    return (
      <TecnoFixClientDashboard
        user={activeUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <TecnoFixLogin
      onSubmit={handleLogin}
      onNavigateToRegister={() => setCurrentView("register")}
    />
  );
}

export default App;