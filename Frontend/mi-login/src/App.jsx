import { useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import { TecnoFixRegister } from "./components/TecnoFixRegister";
import { TecnoFixClientDashboard } from "./components/TecnoFixClientDashboard";
import { TecnoFixDashboard } from "./components/TecnoFixDashboard";

// Datos semilla de catálogo para ADM-001
const INITIAL_EQUIPMENT_TYPES = [
  { id: 1, name: "Notebook", description: "Equipos portátiles de cómputo y laptops", enabled: true },
  { id: 2, name: "Impresora", description: "Impresoras multifuncionales, térmicas y de inyección", enabled: true },
  { id: 3, name: "Teléfono", description: "Smartphones y teléfonos móviles corporativos", enabled: true },
];

const MOCK_ORDERS = [
  { orderId: 101, equipmentTypeId: 2, status: "En diagnóstico" },
  { orderId: 102, equipmentTypeId: 1, status: "Entregada" },
];

function App() {
  const [currentView, setCurrentView] = useState("login"); // "login" | "register" | "dashboard"
  const [activeUser, setActiveUser] = useState(null);

  // Estado del catálogo de tipos de equipo (ADM-001)
  const [equipmentTypes, setEquipmentTypes] = useState(INITIAL_EQUIPMENT_TYPES);
  const [equipmentTypeError, setEquipmentTypeError] = useState(null);

  const handleLogin = (email, password) => {
    console.log("Login simulado:", email);
    const isEmailAdmin = email.toLowerCase().includes("admin");
    const roleDisplay = isEmailAdmin ? "Administrador" : "Cliente";
    const role = isEmailAdmin ? "ADMIN" : "CLIENT";

    setActiveUser({
      id: isEmailAdmin ? 1 : 2,
      userId: isEmailAdmin ? 1 : 2,
      name: isEmailAdmin ? "Antonio Barraza" : (email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Juan Pérez"),
      nombre: isEmailAdmin ? "Antonio Barraza" : (email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Juan Pérez"),
      email: email,
      rut: "12345670K",
      telefono: "+56912345678",
      rol: roleDisplay,
      role: role,
    });
    setCurrentView("dashboard");
  };

  const handleRegisterSuccess = (registeredEmail) => {
    setActiveUser({
      id: 2,
      userId: 2,
      name: registeredEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      nombre: registeredEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      email: registeredEmail,
      rut: "12345670K",
      telefono: "+56912345678",
      rol: "Cliente",
      role: "CLIENT",
    });
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentView("login");
  };

  // Handlers para ADM-001 (Gestionar catálogo de tipos de equipo)
  const handleCreateEquipmentType = async ({ name, description }) => {
    setEquipmentTypeError(null);

    if (!name || !name.trim()) {
      setEquipmentTypeError("Debe completar el campo Nombre");
      return false;
    }

    const trimmed = name.trim();
    const exists = equipmentTypes.some(
      (item) => item.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setEquipmentTypeError("El tipo de equipo ingresado ya se encuentra registrado");
      return false;
    }

    const nextId = equipmentTypes.length > 0 ? Math.max(...equipmentTypes.map((e) => e.id)) + 1 : 1;
    setEquipmentTypes((prev) => [
      ...prev,
      { id: nextId, name: trimmed, description: description?.trim() || null, enabled: true },
    ]);
    return true;
  };

  const handleUpdateEquipmentType = async (id, { name, description }) => {
    setEquipmentTypeError(null);

    if (!name || !name.trim()) {
      setEquipmentTypeError("Debe completar el campo Nombre");
      return false;
    }

    const trimmed = name.trim();
    const exists = equipmentTypes.some(
      (item) => item.id !== id && item.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setEquipmentTypeError("El tipo de equipo ingresado ya se encuentra registrado");
      return false;
    }

    setEquipmentTypes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: trimmed, description: description?.trim() || null } : item
      )
    );
    return true;
  };

  const handleToggleEquipmentTypeStatus = async (id) => {
    setEquipmentTypeError(null);
    const target = equipmentTypes.find((e) => e.id === id);
    if (!target) return false;

    if (target.enabled) {
      const hasActiveOrders = MOCK_ORDERS.some(
        (o) => o.equipmentTypeId === id && o.status !== "Entregada"
      );
      if (hasActiveOrders) {
        setEquipmentTypeError("El tipo de equipo tiene órdenes en proceso y no puede ser deshabilitado");
        return false;
      }
    }

    setEquipmentTypes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
    return true;
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
    if (activeUser.role === "ADMIN" || activeUser.rol === "Administrador") {
      return (
        <TecnoFixDashboard
          role="Administrador"
          user={activeUser}
          onLogout={handleLogout}
          equipmentTypes={equipmentTypes}
          isLoadingEquipmentTypes={false}
          equipmentTypeError={equipmentTypeError}
          onClearEquipmentTypeError={() => setEquipmentTypeError(null)}
          onCreateEquipmentType={handleCreateEquipmentType}
          onUpdateEquipmentType={handleUpdateEquipmentType}
          onToggleEquipmentTypeStatus={handleToggleEquipmentTypeStatus}
          onRefreshEquipmentTypes={() => {}}
        />
      );
    }

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
