import { useEffect, useMemo, useState } from "react";
import type { FC, FormEvent } from "react";
import TecnoFixGear from "./TecnoFixGear";
// @ts-ignore
import "./TecnoFixDashboard.css";
// @ts-ignore
import "./TecnoFixDiagnosis.css";

export type DiagnosisOrderStatus =
  | "RECEIVED"
  | "IN_DIAGNOSIS"
  | "QUOTED"
  | "IN_REPAIR"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "REJECTED";

export interface DiagnosisOrder {
  orderId: number;
  orderNumber: number;
  equipmentType: string;
  brandModel: string;
  reportedFailure: string;
  status: DiagnosisOrderStatus;
  receivedAt: string;
}

export interface DiagnosisFormValues {
  technicalDiagnosis: string;
  laborCost: number;
  partsCost: number;
}

interface TecnoFixDiagnosisProps {
  userName?: string;
  orders: DiagnosisOrder[];
  selectedOrder: DiagnosisOrder | null;
  loadingOrders: boolean;
  openingOrderId: number | null;
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  successTotal: number | null;
  onRefresh: () => void;
  onSelectOrder: (order: DiagnosisOrder) => void;
  onSubmit: (orderId: number, values: DiagnosisFormValues) => void;
  onCancelSelection: () => void;
  onLogout: () => void;
}

const STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  RECEIVED: { label: "Recibida", bg: "#E2E8F0", text: "#334155", dot: "#64748B" },
  IN_DIAGNOSIS: { label: "En diagnóstico", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  QUOTED: { label: "Presupuestada", bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  IN_REPAIR: { label: "En reparación", bg: "#EDE9FE", text: "#6D28D9", dot: "#8B5CF6" },
  READY_FOR_PICKUP: { label: "Lista para retiro", bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  DELIVERED: { label: "Entregada", bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  REJECTED: { label: "Rechazada", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseCost = (value: string): number | null => {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) return null;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META.RECEIVED;

  return (
    <span className="tf-status" style={{ background: meta.bg, color: meta.text }}>
      <span className="tf-statusDot" style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
};

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={18}
    height={18}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const TecnoFixDiagnosis: FC<TecnoFixDiagnosisProps> = ({
  userName,
  orders,
  selectedOrder,
  loadingOrders,
  openingOrderId,
  submitting,
  error,
  successMessage,
  successTotal,
  onRefresh,
  onSelectOrder,
  onSubmit,
  onCancelSelection,
  onLogout,
}) => {
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState<string>("");
  const [laborCost, setLaborCost] = useState<string>("");
  const [partsCost, setPartsCost] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  const displayName = userName?.trim() || "Técnico";

  useEffect(() => {
    setTechnicalDiagnosis("");
    setLaborCost("");
    setPartsCost("");
    setFormError(null);
  }, [selectedOrder?.orderId]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const text = [
        order.orderNumber,
        order.equipmentType,
        order.brandModel,
        order.reportedFailure,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [orders, search]);

  const receivedCount = orders.filter((order) => order.status === "RECEIVED").length;
  const inDiagnosisCount = orders.filter((order) => order.status === "IN_DIAGNOSIS").length;

  const summaryCards = [
    {
      label: "Órdenes disponibles",
      value: orders.length,
      hint: "para diagnosticar",
      icon: "🧾",
    },
    {
      label: "Por abrir",
      value: receivedCount,
      hint: "pasarán a En diagnóstico",
      icon: "📥",
    },
    {
      label: "En diagnóstico",
      value: inDiagnosisCount,
      hint: "ya abiertas",
      icon: "🛠️",
    },
  ];

  const laborValue = Math.max(parseCost(laborCost) ?? 0, 0);
  const partsValue = Math.max(parseCost(partsCost) ?? 0, 0);
  const total = laborValue + partsValue;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!selectedOrder) return;

    const trimmedDiagnosis = technicalDiagnosis.trim();

    if (!trimmedDiagnosis) {
      setFormError("Debe completar el campo Diagnóstico técnico");
      return;
    }

    if (!laborCost.trim()) {
      setFormError("Debe completar el campo Costo de mano de obra");
      return;
    }

    if (!partsCost.trim()) {
      setFormError("Debe completar el campo Costo de repuestos");
      return;
    }

    const labor = parseCost(laborCost);
    const parts = parseCost(partsCost);

    if (labor === null || parts === null || labor < 0 || parts < 0) {
      setFormError("El costo ingresado no es válido");
      return;
    }

    setFormError(null);
    onSubmit(selectedOrder.orderId, {
      technicalDiagnosis: trimmedDiagnosis,
      laborCost: labor,
      partsCost: parts,
    });
  };

  return (
    <div className="tf-dashboard tf-diagnosis">
      <div className="tf-shell">
        <aside className="tf-sidebar">
          <div className="tf-brand">
            <div className="tf-brandIcon" aria-hidden="true">
              <TecnoFixGear size={26} color="#082F49" />
            </div>
            <div>
              <div className="tf-brandTitle">TecnoFix</div>
              <div className="tf-brandText">Gestión de reparaciones</div>
            </div>
          </div>

          <nav className="tf-navGroup" aria-label="Navegación del panel de diagnóstico">
            <div className="tf-navLabel">Menú</div>
            <button
              className="tf-navButton is-active"
              type="button"
              aria-current="page"
            >
              <span className="tf-navIcon" aria-hidden="true">🩺</span>
              Diagnóstico
            </button>
            <button
              className="tf-navButton"
              type="button"
              onClick={onRefresh}
              disabled={loadingOrders || submitting}
              title="Volver a cargar las órdenes disponibles"
            >
              <span className="tf-navIcon" aria-hidden="true">↻</span>
              Actualizar
            </button>
          </nav>

          <div className="tf-sidebarFooter">
            <div className="tf-footerIcon" aria-hidden="true">
              <UserIcon />
            </div>
            <div className="tf-footerIdentity">
              <strong>{displayName}</strong>
              <span>Técnico</span>
            </div>
            <div className="tf-footerActions">
              <button
                className="tf-button tf-buttonSmall"
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <main className="tf-page">
          <div className="tf-canvas">
            <section className="tf-topbar">
              <label className="tf-search">
                <span aria-hidden="true">🔍</span>
                <input
                  type="search"
                  aria-label="Buscar órdenes por número, equipo o falla"
                  placeholder="Buscar por orden, equipo o falla"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <div className="tf-userBox">
                <div className="tf-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="tf-userName">{displayName}</div>
                  <div className="tf-userRole">Técnico</div>
                </div>
              </div>
            </section>

            <section className="tf-hero">
              <div>
                <h1 className="tf-title">Diagnóstico y presupuesto</h1>
                <p className="tf-subtitle">
                  Selecciona una orden recibida o en diagnóstico para registrar el
                  diagnóstico técnico y el presupuesto.
                </p>
              </div>
              <button
                className="tf-button tf-buttonPrimary"
                type="button"
                onClick={onRefresh}
                disabled={loadingOrders || submitting}
              >
                {loadingOrders ? "Actualizando..." : "Actualizar"}
              </button>
            </section>

            <section className="tf-cardGrid" aria-label="Resumen de órdenes para diagnóstico">
              {summaryCards.map((card, index) => (
                <article
                  className={`tf-card ${index === 0 ? "is-featured" : ""}`}
                  key={card.label}
                >
                  <div className="tf-cardTop">
                    <span className="tf-cardLabel">{card.label}</span>
                    <span className="tf-cardIcon" aria-hidden="true">{card.icon}</span>
                  </div>
                  <strong className="tf-cardValue">{card.value}</strong>
                  <span className="tf-cardHint">{card.hint}</span>
                </article>
              ))}
            </section>

            {error && (
              <div className="tf-alert tf-alertError" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="tf-alert tf-alertSuccess" role="status">
                <strong>{successMessage}</strong>
                {successTotal !== null && (
                  <span> Total: {money.format(successTotal)}</span>
                )}
              </div>
            )}

            <section className="tf-diagnosisGrid">
              <article className="tf-panel">
                <header className="tf-panelHeader">
                  <div>
                    <h2>Órdenes disponibles</h2>
                    <p>Órdenes en estado Recibida o En diagnóstico.</p>
                  </div>
                  <span className="tf-count" aria-label={`${orders.length} órdenes disponibles`}>
                    {orders.length}
                  </span>
                </header>

                <div className="tf-tableWrap">
                  {loadingOrders ? (
                    <div className="tf-empty">
                      <span className="tf-spinner" aria-hidden="true" />
                      Cargando órdenes...
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="tf-empty">
                      {orders.length === 0
                        ? "No hay órdenes disponibles para diagnóstico."
                        : "No se encontraron órdenes con ese criterio."}
                    </div>
                  ) : (
                    <table className="tf-table">
                      <thead>
                        <tr>
                          <th>Orden</th>
                          <th>Equipo</th>
                          <th>Falla reportada</th>
                          <th>Estado</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const isSelected = selectedOrder?.orderId === order.orderId;
                          const isOpening = openingOrderId === order.orderId;

                          return (
                            <tr
                              key={order.orderId}
                              className={isSelected ? "is-selected" : ""}
                            >
                              <td>
                                <span className="tf-orderId">#{order.orderNumber}</span>
                                <div className="tf-device">{formatDate(order.receivedAt)}</div>
                              </td>
                              <td className="tf-cellEquipment">
                                <strong>{order.equipmentType}</strong>
                                <div className="tf-device">{order.brandModel}</div>
                              </td>
                              <td className="tf-cellFault" title={order.reportedFailure}>
                                {order.reportedFailure}
                              </td>
                              <td>
                                <StatusBadge status={order.status} />
                              </td>
                              <td>
                                <button
                                  className="tf-button tf-buttonGhost tf-buttonSmall"
                                  type="button"
                                  onClick={() => onSelectOrder(order)}
                                  disabled={
                                    openingOrderId !== null ||
                                    submitting ||
                                    isSelected
                                  }
                                  title={
                                    order.status === "RECEIVED"
                                      ? "Abrir la orden y pasarla a En diagnóstico"
                                      : "Registrar diagnóstico y presupuesto"
                                  }
                                >
                                  {isOpening
                                    ? "Abriendo..."
                                    : isSelected
                                      ? "En edición"
                                      : order.status === "RECEIVED"
                                        ? "Abrir"
                                        : "Diagnosticar"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </article>

              <aside className="tf-panel tf-formPanel">
                {selectedOrder ? (
                  <form className="tf-form" onSubmit={handleSubmit} noValidate>
                    <header className="tf-formHeader">
                      <div>
                        <span className="tf-formEyebrow">
                          Orden #{selectedOrder.orderNumber}
                        </span>
                        <h2>Diagnóstico y presupuesto</h2>
                        <p>
                          {selectedOrder.equipmentType} · {selectedOrder.brandModel}
                        </p>
                      </div>
                      <StatusBadge status={selectedOrder.status} />
                    </header>

                    <div className="tf-orderSummary">
                      <div>
                        <span>Falla reportada</span>
                        <strong>{selectedOrder.reportedFailure}</strong>
                      </div>
                      <div>
                        <span>Fecha de recepción</span>
                        <strong>{formatDate(selectedOrder.receivedAt)}</strong>
                      </div>
                    </div>

                    <div className="tf-field">
                      <label htmlFor="technicalDiagnosis">
                        Diagnóstico técnico <span aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="technicalDiagnosis"
                        className="tf-textarea"
                        placeholder="Describe el diagnóstico técnico del equipo..."
                        value={technicalDiagnosis}
                        onChange={(event) => {
                          setTechnicalDiagnosis(event.target.value);
                          setFormError(null);
                        }}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="tf-formRow">
                      <div className="tf-field">
                        <label htmlFor="laborCost">
                          Costo de mano de obra <span aria-hidden="true">*</span>
                        </label>
                        <div className="tf-moneyInput">
                          <span aria-hidden="true">$</span>
                          <input
                            id="laborCost"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0"
                            value={laborCost}
                            onChange={(event) => {
                              setLaborCost(event.target.value);
                              setFormError(null);
                            }}
                            disabled={submitting}
                            required
                          />
                        </div>
                      </div>

                      <div className="tf-field">
                        <label htmlFor="partsCost">
                          Costo de repuestos <span aria-hidden="true">*</span>
                        </label>
                        <div className="tf-moneyInput">
                          <span aria-hidden="true">$</span>
                          <input
                            id="partsCost"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            placeholder="0"
                            value={partsCost}
                            onChange={(event) => {
                              setPartsCost(event.target.value);
                              setFormError(null);
                            }}
                            disabled={submitting}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="tf-total">
                      <div>
                        <span>Costo total</span>
                        <small>Mano de obra + repuestos</small>
                      </div>
                      <strong>{money.format(total)}</strong>
                    </div>

                    {formError && (
                      <div className="tf-formError" role="alert">
                        {formError}
                      </div>
                    )}

                    <div className="tf-formActions">
                      <button
                        className="tf-button"
                        type="button"
                        onClick={onCancelSelection}
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                      <button
                        className="tf-button tf-buttonPrimary"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting
                          ? "Registrando..."
                          : "Registrar diagnóstico y presupuesto"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="tf-formEmpty">
                    <div className="tf-formEmptyIcon" aria-hidden="true">🛠️</div>
                    <h2>Selecciona una orden</h2>
                    <p>
                      Elige una orden del listado para abrir el diagnóstico. Si está
                      en estado Recibida, pasará automáticamente a En diagnóstico.
                    </p>
                  </div>
                )}
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TecnoFixDiagnosis;
