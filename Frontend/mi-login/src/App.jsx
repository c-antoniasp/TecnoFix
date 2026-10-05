import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixRegisterTechnician from "./components/TecnoFixRegisterTechnician";

const API_URL = "http://localhost:5032";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [errorRegTech, setErrorRegTech] = useState(null);
  const [successRegTech, setSuccessRegTech] = useState(null);

  const handleLogin = (email, password) => {
    console.log("Login enviado:", email, password);
    // Temporalmente te envía al registro para probar la pantalla
    setCurrentScreen("registerTechnician"); 
  };

  const handleRegisterTechnician = async (name, email, specialty) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/technician`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, specialty }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setCurrentScreen("login");
          return;
        }
        setErrorRegTech(data.message ?? "Error al registrar técnico");
        setSuccessRegTech(null);
      } else {
        setSuccessRegTech(data.message);
        setErrorRegTech(null);

        setTimeout(() => {
          setCurrentScreen("dashboard");
        },1500);
      }
    } catch (err) {
      setErrorRegTech("No se pudo conectar con el servidor");
    }
  };

  return (
    <>
      {currentScreen === "login" && (
        <TecnoFixLogin onSubmit={handleLogin} />
      )}
      
      {currentScreen === "registerTechnician" && (
        <TecnoFixRegisterTechnician
          onSubmit={handleRegisterTechnician}
          error={errorRegTech}
          successMessage={successRegTech}
          onBack={() => setCurrentScreen("login")}
        />
      )}
    </>
  );
}

export default App;