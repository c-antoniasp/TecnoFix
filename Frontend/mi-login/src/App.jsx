import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixDashboard from "./components/TecnoFixDashboard";
import { logout as apiLogout } from "./Api/auth";

function App() {
  // El token ya no se guarda en localStorage: vive en una cookie HttpOnly
  // que pone el backend, así que aquí solo recordamos los datos del usuario
  // mientras dura la pestaña (igual que en el proyecto de la Ayudantía).
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Si falla el logout en el backend, igual cerramos la sesión en el front.
    }
    setUser(null);
  };

  if (user === null) {
    return <TecnoFixLogin onLoginSuccess={setUser} />;
  }

  if (user.role === "CLIENT") {
    return (
      <div>
        <p>El dashboard del cliente aún no está implementado.</p>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
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
