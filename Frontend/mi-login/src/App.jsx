import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixDashboard from "./components/TecnoFixDashboard";

const API_URL = "http://localhost:5032";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const getTokenExpiration = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Recupera la sesión guardada. Si falta algo, está dañado o el token expiró, la descarta.
const getStoredSession = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (!token || !savedUser) {
      clearSession();
      return null;
    }

    const exp = getTokenExpiration(token);
    if (exp !== null && exp * 1000 <= Date.now()) {
      clearSession();
      return null;
    }

    return JSON.parse(savedUser);
  } catch {
    clearSession();
    return null;
  }
};

function App() {
  // Al recargar, se restaura la sesión si el token sigue vigente; si no, se muestra el login.
  const [user, setUser] = useState(getStoredSession);
  const [error, setError] = useState("");

  const handleLogin = async (email, password) => {
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Error al iniciar sesión");
        return;
      }

      const loggedUser = {
        userId: data.userId,
        name: data.name,
        role: data.role,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch {
      setError("No se pudo conectar con el servidor");
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setError("");
  };

  if (user === null) {
    return <TecnoFixLogin onSubmit={handleLogin} error={error} />;
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