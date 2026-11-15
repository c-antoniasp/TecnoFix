import { useEffect, useRef, useState } from "react";
import { ApiError } from "../Api/client";
import { decideBudget, getClientOrders } from "../Api/repairOrders";
import type { ClientRepairOrder } from "../Api/repairOrders";
import { formatOrderCost, formatOrderDate } from "../utils/orderFormat";
import ConfirmationDialog from "./ConfirmationDialog";
import { DashboardLayout, RepairOrderStatusBadge } from "./TecnoFixDashboard";

interface TecnoFixClientOrdersProps {
  userName: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onSessionExpired: (message: string) => void;
}

const expiredSession = "Su sesión expiró. Inicie sesión nuevamente.";

export default function TecnoFixClientOrders({ userName, onNavigate, onLogout, onSessionExpired }: TecnoFixClientOrdersProps) {
  const [orders, setOrders] = useState<ClientRepairOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [decision, setDecision] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const submission = useRef<AbortController | null>(null);
  const selected = orders.find(({ order }) => order.orderId === selectedOrderId);

  useEffect(() => {
    const controller = new AbortController();
    getClientOrders(controller.signal)
      .then((nextOrders) => {
        if (!controller.signal.aborted) setOrders(nextOrders);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) onSessionExpired(expiredSession);
        else setLoadError(error instanceof Error ? error.message : "No se pudieron cargar sus órdenes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refreshCount, onSessionExpired]);

  useEffect(() => () => submission.current?.abort(), []);

  const refresh = () => {
    setLoadError("");
    setLoading(true);
    setRefreshCount((count) => count + 1);
  };

  const confirmDecision = async () => {
    if (!selected?.canDecideBudget || decision === null || submission.current) return;

    const orderId = selected.order.orderId;
    const controller = new AbortController();
    submission.current = controller;
    setDecision(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const response = await decideBudget(orderId, decision, controller.signal);
      if (controller.signal.aborted) return;
      setOrders((current) => current.map((item) => item.order.orderId === orderId
        ? {
            ...item,
            order: { ...item.order, status: response.status },
            canDecideBudget: false,
            availableForPickup: response.availableForPickup,
            decisionDate: response.decisionDate,
          }
        : item));
      setNotice({ message: response.message, error: false });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) {
        onSessionExpired(expiredSession);
        return;
      }
      setNotice({
        message: error instanceof Error ? error.message : "No se pudo registrar la decisión.",
        error: true,
      });
      if (error instanceof ApiError && [0, 403, 404, 409].includes(error.status)) refresh();
    } finally {
      submission.current = null;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      active="Órdenes"
      role="Cliente"
      userName={userName}
      onNavigate={onNavigate}
      onLogout={onLogout}
      navigationDisabled={submitting}
      className="tf-clientOrders"
    >
      <header className="tf-hero">
        <h1 className="tf-title">Mis órdenes</h1>
        <button className="tf-button" type="button" onClick={refresh} disabled={loading || submitting}>
          Actualizar
        </button>
      </header>
      {loadError && <p className="tf-alert tf-alertError" role="alert">{loadError}</p>}
      {notice && (
        <p className={`tf-alert ${notice.error ? "tf-alertError" : "tf-alertSuccess"}`} role={notice.error ? "alert" : "status"}>
          {notice.message}
        </p>
      )}
      <div className="tf-mainGrid">
        <section className="tf-panel" aria-labelledby="tf-client-order-list-title" aria-busy={loading}>
          <header className="tf-panelHeader">
            <h2 id="tf-client-order-list-title">Órdenes de reparación</h2>
          </header>
          {loading && <p className="tf-empty" role="status">Cargando órdenes…</p>}
          {!loading && !loadError && orders.length === 0 && <p className="tf-empty">No tiene órdenes registradas.</p>}
          {orders.length > 0 && (
            <ul className="tf-clientOrderList">
              {orders.map(({ order }) => (
                <li key={order.orderId}>
                  <button
                    className="tf-clientOrderRow"
                    type="button"
                    disabled={submitting}
                    aria-pressed={selectedOrderId === order.orderId}
                    onClick={() => {
                      setSelectedOrderId(order.orderId);
                      setNotice(null);
                    }}
                  >
                    <span>
                      <span className="tf-orderId">Orden #{order.orderNumber}</span>
                      <span className="tf-device">{order.brandModel}</span>
                    </span>
                    <RepairOrderStatusBadge status={order.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="tf-panel" aria-labelledby="tf-client-order-detail-title" aria-busy={submitting}>
          <header className="tf-panelHeader">
            <h2 id="tf-client-order-detail-title">{selected ? `Orden #${selected.order.orderNumber}` : "Detalle de la orden"}</h2>
            {selected && <RepairOrderStatusBadge status={selected.order.status} />}
          </header>
          {selected ? (
            <div className="tf-clientOrderBody">
              <dl className="tf-clientOrderFacts">
                <div><dt>Equipo</dt><dd>{selected.order.equipmentType} · {selected.order.brandModel}</dd></div>
                <div><dt>Recepción</dt><dd>{formatOrderDate(selected.order.receivedAt)}</dd></div>
                <div><dt>Falla reportada</dt><dd>{selected.order.reportedFailure}</dd></div>
              </dl>
              {selected.budget ? (
                <>
                  <h3>Presupuesto</h3>
                  <dl className="tf-clientOrderFacts">
                    {selected.budget.technicalDiagnosis && (
                      <div><dt>Diagnóstico técnico</dt><dd>{selected.budget.technicalDiagnosis}</dd></div>
                    )}
                    <div><dt>Mano de obra</dt><dd>{formatOrderCost(selected.budget.laborCost)}</dd></div>
                    <div><dt>Repuestos</dt><dd>{formatOrderCost(selected.budget.partsCost)}</dd></div>
                    <div><dt>Total</dt><dd><strong>{formatOrderCost(selected.budget.totalCost)}</strong></dd></div>
                  </dl>
                  {selected.decisionDate && <p className="tf-device">Decisión registrada el {formatOrderDate(selected.decisionDate)}.</p>}
                </>
              ) : <p>Esta orden aún no tiene presupuesto.</p>}
              {selected.availableForPickup && (
                <p className="tf-alert tf-alertSuccess">
                  {selected.order.status === "REJECTED"
                    ? "Equipo disponible para retiro sin reparar."
                    : "Equipo disponible para retiro."}
                </p>
              )}
              {selected.canDecideBudget && (
                <div className="tf-actions">
                  <button className="tf-button tf-buttonPrimary" type="button" onClick={() => setDecision(true)} disabled={submitting || loading || Boolean(loadError)}>
                    Aprobar presupuesto
                  </button>
                  <button className="tf-button" type="button" onClick={() => setDecision(false)} disabled={submitting || loading || Boolean(loadError)}>
                    Rechazar presupuesto
                  </button>
                </div>
              )}
              {submitting && <p role="status">Registrando decisión…</p>}
            </div>
          ) : <p className="tf-empty">Seleccione una orden para ver su detalle.</p>}
        </section>
      </div>
      <ConfirmationDialog
        open={decision !== null}
        message={decision === true
          ? "¿Está seguro de que desea aprobar este presupuesto?"
          : "¿Está seguro de que desea rechazar este presupuesto?"}
        onCancel={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </DashboardLayout>
  );
}
