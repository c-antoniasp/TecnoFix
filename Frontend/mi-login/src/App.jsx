import { useCallback, useEffect, useState } from "react";
import TecnoFixLogin from "./components/TecnoFixLogin";
import TecnoFixRegisterTechnician from "./components/TecnoFixRegisterTechnician";
import TecnoFixDiagnosis from "./components/TecnoFixDiagnosis";

const API_URL = "http://localhost:5032";
const TOKEN_KEY = "token";

const readTokenClaims = (token) => {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const decoded = atob(padded);
    const json = decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getRoleFromToken = (token) => {
  const claims = readTokenClaims(token);

  if (!claims) return null;

  const role =
    claims.role ??
    claims.roles ??
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const normalizedRole = Array.isArray(role) ? role[0] : role;

  return typeof normalizedRole === "string"
    ? normalizedRole.toUpperCase()
    : null;
};

const getScreenForToken = (token) => {
  if (!token) return "login";

  return getRoleFromToken(token) === "ADMIN"
    ? "registerTechnician"
    : "technicianDiagnosis";
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(() =>
    getScreenForToken(localStorage.getItem(TOKEN_KEY))
  );
  const [loginError, setLoginError] = useState(null);
  const [errorRegTech, setErrorRegTech] = useState(null);
  const [successRegTech, setSuccessRegTech] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openingOrderId, setOpeningOrderId] = useState(null);
  const [diagnosisSubmitting, setDiagnosisSubmitting] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState(null);
  const [diagnosisSuccess, setDiagnosisSuccess] = useState(null);
  const [diagnosisTotal, setDiagnosisTotal] = useState(null);

  const clearDiagnosisState = useCallback(() => {
    setSelectedOrder(null);
    setDiagnosisError(null);
    setDiagnosisSuccess(null);
    setDiagnosisTotal(null);
  }, []);

  const handleSessionExpired = useCallback(
    (message = "Debe iniciar sesión nuevamente.") => {
      localStorage.removeItem(TOKEN_KEY);
      setLoginError(message);
      setCurrentScreen("login");
      setOrders([]);
      setOrdersError(null);
      setErrorRegTech(null);
      setSuccessRegTech(null);
      clearDiagnosisState();
    },
    [clearDiagnosisState]
  );

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      handleSessionExpired();
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const res = await fetch(`${API_URL}/api/technician/orders/diagnosis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        handleSessionExpired(data?.message ?? "Debe iniciar sesión nuevamente.");
        return;
      }

      if (res.status === 403) {
        setOrdersError("No tiene permisos para acceder al panel de diagnóstico.");
        return;
      }

      if (!res.ok) {
        setOrdersError(data?.message ?? "Ocurrió un error interno en el servidor.");
        return;
      }

      const nextOrders = Array.isArray(data) ? data : [];
      setOrders(nextOrders);
      setSelectedOrder((current) =>
        current
          ? nextOrders.find((order) => order.orderId === current.orderId) ?? null
          : null
      );
    } catch {
      setOrdersError("No se pudo conectar con el servidor");
    } finally {
      setOrdersLoading(false);
    }
  }, [handleSessionExpired]);

  useEffect(() => {
    if (currentScreen === "technicianDiagnosis") {
      // La carga inicial sincroniza el panel con la API; el estado de carga
      // se actualiza dentro de la promesa de loadOrders.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadOrders();
    }
  }, [currentScreen, loadOrders]);

  const handleLogin = () => {
  setLoginError(null);

  if (import.meta.env.DEV) {
    localStorage.setItem(TOKEN_KEY, "dev-technician");
    setCurrentScreen("technicianDiagnosis");
    return;
  }

  setLoginError("Debe iniciar sesión.");
  };

  const handleSaveDevToken = (token) => {
    const trimmedToken = token.trim();

    if (!trimmedToken) return;

    localStorage.setItem(TOKEN_KEY, trimmedToken);
    setLoginError(null);
    setOrders([]);
    setOrdersError(null);
    setErrorRegTech(null);
    setSuccessRegTech(null);
    clearDiagnosisState();
    setCurrentScreen(getScreenForToken(trimmedToken));
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setOrders([]);
    setOrdersError(null);
    setLoginError(null);
    setErrorRegTech(null);
    setSuccessRegTech(null);
    clearDiagnosisState();
    setCurrentScreen("login");
  };

  const handleSelectOrder = async (order) => {
    if (openingOrderId !== null || diagnosisSubmitting) return;

    setDiagnosisError(null);
    setDiagnosisSuccess(null);
    setDiagnosisTotal(null);

    if (order.status !== "RECEIVED") {
      setSelectedOrder(order);
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      handleSessionExpired();
      return;
    }

    setOpeningOrderId(order.orderId);

    try {
      const res = await fetch(
        `${API_URL}/api/technician/orders/${order.orderId}/diagnosis/start`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        handleSessionExpired(data?.message ?? "Debe iniciar sesión nuevamente.");
        return;
      }

      if (res.status === 403) {
        setDiagnosisError("No tiene permisos para realizar esta acción.");
        return;
      }

      if (!res.ok) {
        setDiagnosisError(data?.message ?? "Ocurrió un error interno en el servidor.");
        return;
      }

      const openedOrder = { ...order, status: "IN_DIAGNOSIS" };
      setOrders((prev) =>
        prev.map((item) => (item.orderId === order.orderId ? openedOrder : item))
      );
      setSelectedOrder(openedOrder);
    } catch {
      setDiagnosisError("No se pudo conectar con el servidor");
    } finally {
      setOpeningOrderId(null);
    }
  };

  const handleRegisterDiagnosis = async (orderId, values) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      handleSessionExpired();
      return;
    }

    setDiagnosisSubmitting(true);
    setDiagnosisError(null);
    setDiagnosisSuccess(null);
    setDiagnosisTotal(null);

    try {
      const res = await fetch(`${API_URL}/api/technician/orders/${orderId}/diagnosis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        handleSessionExpired(data?.message ?? "Debe iniciar sesión nuevamente.");
        return;
      }

      if (res.status === 403) {
        setDiagnosisError("No tiene permisos para realizar esta acción.");
        return;
      }

      if (!res.ok) {
        setDiagnosisError(data?.message ?? "Ocurrió un error interno en el servidor.");
        return;
      }

      setDiagnosisSuccess(
        data?.message ?? "Diagnóstico y presupuesto registrados exitosamente."
      );
      setDiagnosisTotal(typeof data?.totalCost === "number" ? data.totalCost : null);
      setOrders((prev) => prev.filter((item) => item.orderId !== orderId));
      setSelectedOrder(null);
    } catch {
      setDiagnosisError("No se pudo conectar con el servidor");
    } finally {
      setDiagnosisSubmitting(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedOrder(null);
    setDiagnosisError(null);
  };

  const handleRegisterTechnician = async (name, email, specialty) => {
    const token = localStorage.getItem(TOKEN_KEY);

    setErrorRegTech(null);
    setSuccessRegTech(null);

    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/technician`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, specialty }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          handleSessionExpired(data?.message ?? "Debe iniciar sesión nuevamente.");
          return;
        }

        setErrorRegTech(data?.message ?? "No tiene permisos para registrar técnicos.");
        setSuccessRegTech(null);
        return;
      }

      setSuccessRegTech(data?.message ?? "Técnico registrado exitosamente.");
      setErrorRegTech(null);
    } catch {
      setErrorRegTech("No se pudo conectar con el servidor");
      setSuccessRegTech(null);
    }
  };

  if (currentScreen === "login") {
    return (
      <TecnoFixLogin
        onSubmit={handleLogin}
        error={loginError}
        onSaveToken={handleSaveDevToken}
        onNavigateToRegisterTechnician={() => {
          setLoginError(null);
          setErrorRegTech(null);
          setSuccessRegTech(null);
          setCurrentScreen("registerTechnician");
        }}
      />
    );
  }

  if (currentScreen === "registerTechnician") {
    return (
      <TecnoFixRegisterTechnician
        onSubmit={handleRegisterTechnician}
        error={errorRegTech}
        successMessage={successRegTech}
        onBack={() => {
          setErrorRegTech(null);
          setSuccessRegTech(null);
          setCurrentScreen("login");
        }}
      />
    );
  }

  return (
    <TecnoFixDiagnosis
      orders={orders}
      selectedOrder={selectedOrder}
      loadingOrders={ordersLoading}
      openingOrderId={openingOrderId}
      submitting={diagnosisSubmitting}
      error={ordersError ?? diagnosisError}
      successMessage={diagnosisSuccess}
      successTotal={diagnosisTotal}
      onRefresh={loadOrders}
      onSelectOrder={handleSelectOrder}
      onSubmit={handleRegisterDiagnosis}
      onCancelSelection={handleCancelSelection}
      onLogout={handleLogout}
    />
  );
}

export default App;
