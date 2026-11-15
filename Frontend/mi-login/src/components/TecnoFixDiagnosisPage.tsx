import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../Api/client";
import { getOrdersForDiagnosis, registerDiagnosis, startDiagnosis } from "../Api/diagnosis";
import type { RepairOrderSummary } from "../Api/repairOrders";
import TecnoFixDiagnosis from "./TecnoFixDiagnosis";
import type { DiagnosisFormValues } from "./TecnoFixDiagnosis";

interface TecnoFixDiagnosisPageProps {
  userName: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onSessionExpired: (message: string) => void;
}

// ORD-002: conecta el panel de diagnóstico con el backend (sesión por cookie).
export default function TecnoFixDiagnosisPage({ userName, onNavigate, onLogout, onSessionExpired }: TecnoFixDiagnosisPageProps) {
  const [orders, setOrders] = useState<RepairOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrderSummary | null>(null);
  const [openingOrderId, setOpeningOrderId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successTotal, setSuccessTotal] = useState<number | null>(null);

  // Devuelve el mensaje a mostrar, o null si la sesión expiró y ya se volvió al login.
  const toMessage = useCallback((err: unknown): string | null => {
    if (err instanceof ApiError && err.status === 401) {
      onSessionExpired("Su sesión expiró. Inicie sesión nuevamente.");
      return null;
    }
    if (err instanceof ApiError && err.status === 403) return "No tiene permisos para realizar esta acción.";
    return err instanceof Error ? err.message : "No se pudo conectar con el servidor";
  }, [onSessionExpired]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError(null);
    try {
      const nextOrders = await getOrdersForDiagnosis();
      setOrders(nextOrders);
      setSelectedOrder((current) =>
        current ? nextOrders.find((order) => order.orderId === current.orderId) ?? null : null
      );
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setOrdersLoading(false);
    }
  }, [toMessage]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
    setSuccessTotal(null);
  };

  const handleSelectOrder = async (order: RepairOrderSummary) => {
    if (openingOrderId !== null || submitting) return;
    clearMessages();

    if (order.status !== "RECEIVED") {
      setSelectedOrder(order);
      return;
    }

    // Al abrir una orden «Recibida» el backend la pasa a «En diagnóstico».
    setOpeningOrderId(order.orderId);
    try {
      await startDiagnosis(order.orderId);
      const openedOrder: RepairOrderSummary = { ...order, status: "IN_DIAGNOSIS" };
      setOrders((prev) => prev.map((item) => (item.orderId === order.orderId ? openedOrder : item)));
      setSelectedOrder(openedOrder);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setOpeningOrderId(null);
    }
  };

  const handleRegisterDiagnosis = async (orderId: number, values: DiagnosisFormValues) => {
    setSubmitting(true);
    clearMessages();
    try {
      const data = await registerDiagnosis(orderId, values);
      setSuccessMessage(data.message);
      setSuccessTotal(typeof data.totalCost === "number" ? data.totalCost : null);
      setOrders((prev) => prev.filter((item) => item.orderId !== orderId));
      setSelectedOrder(null);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TecnoFixDiagnosis
      userName={userName}
      orders={orders}
      selectedOrder={selectedOrder}
      loadingOrders={ordersLoading}
      openingOrderId={openingOrderId}
      submitting={submitting}
      error={error}
      successMessage={successMessage}
      successTotal={successTotal}
      onRefresh={loadOrders}
      onSelectOrder={handleSelectOrder}
      onSubmit={handleRegisterDiagnosis}
      onCancelSelection={() => {
        setSelectedOrder(null);
        setError(null);
      }}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  );
}
