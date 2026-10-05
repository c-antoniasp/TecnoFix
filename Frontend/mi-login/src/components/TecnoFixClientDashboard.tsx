import { useState } from "react";
import type { FC, CSSProperties } from "react";
import { UserRound } from "lucide-react";
import TecnoFixGear from "./TecnoFixGear";

export interface BitacoraItem {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  responsable: string;
  comentario: string;
}

export interface OrdenReparacion {
  id: string; // ej. ORD-0012
  fechaRecepcion: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  descripcionFalla: string;
  accesorios?: string;
  estado:
    | "Recibida"
    | "En diagnóstico"
    | "Presupuestada"
    | "En reparación"
    | "Lista para retiro"
    | "Entregada"
    | "Rechazada";
  diagnosticoTecnico?: string;
  presupuesto?: {
    manoDeObra: number;
    repuestos: number;
    total: number;
    decisionTomada?: "Aprobada" | "Rechazada";
    fechaDecision?: string;
  };
  bitacora: BitacoraItem[];
}

export interface UserClient {
  id: number;
  nombre: string;
  email: string;
  rut: string;
  telefono: string;
  rol: string;
}

interface TecnoFixClientDashboardProps {
  user: UserClient;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

// Datos iniciales de demostración con órdenes en diferentes estados del ciclo de vida
const INITIAL_ORDERS: OrdenReparacion[] = [
  {
    id: "ORD-1042",
    fechaRecepcion: "02/10/2026",
    tipoEquipo: "Notebook",
    marca: "Lenovo",
    modelo: "ThinkPad E14 Gen 4",
    numeroSerie: "PF39X0L2",
    descripcionFalla: "El equipo enciende pero la pantalla queda en negro y emite 3 pitidos.",
    accesorios: "Cargador original USB-C y funda",
    estado: "Presupuestada",
    diagnosticoTecnico: "Falla en el módulo de memoria RAM principal y acumulación de sulfato en pistas.",
    presupuesto: {
      manoDeObra: 25000,
      repuestos: 38000,
      total: 63000,
    },
    bitacora: [
      {
        id: 3,
        fecha: "03/10/2026",
        hora: "11:45",
        estado: "Presupuestada",
        responsable: "Carlos Mendoza (Técnico)",
        comentario: "Presupuesto emitido y enviado para evaluación del cliente.",
      },
      {
        id: 2,
        fecha: "02/10/2026",
        hora: "16:20",
        estado: "En diagnóstico",
        responsable: "Carlos Mendoza (Técnico)",
        comentario: "Se desarma el equipo y se detecta módulo de memoria averiado.",
      },
      {
        id: 1,
        fecha: "02/10/2026",
        hora: "09:30",
        estado: "Recibida",
        responsable: "Recepción TecnoFix",
        comentario: "Ingreso de equipo en mesón de atención con cargador.",
      },
    ],
  },
  {
    id: "ORD-1038",
    fechaRecepcion: "28/09/2026",
    tipoEquipo: "Smartphone",
    marca: "Samsung",
    modelo: "Galaxy S23",
    numeroSerie: "SM-S911B-883",
    descripcionFalla: "Pantalla trizada tras caída, táctil funciona de forma intermitente.",
    accesorios: "Sin accesorios",
    estado: "En reparación",
    diagnosticoTecnico: "Módulo display OLED quebrado. Requiere reemplazo completo de frontal.",
    presupuesto: {
      manoDeObra: 20000,
      repuestos: 85000,
      total: 105000,
      decisionTomada: "Aprobada",
      fechaDecision: "29/09/2026 14:10",
    },
    bitacora: [
      {
        id: 4,
        fecha: "29/09/2026",
        hora: "14:10",
        estado: "En reparación",
        responsable: "Cliente (Aprobación en línea)",
        comentario: "El cliente aprobó el presupuesto. Repuesto solicitado a bodega.",
      },
      {
        id: 3,
        fecha: "29/09/2026",
        hora: "10:00",
        estado: "Presupuestada",
        responsable: "Andrés Silva (Técnico)",
        comentario: "Presupuesto de reemplazo de pantalla OLED disponible.",
      },
      {
        id: 2,
        fecha: "28/09/2026",
        hora: "15:10",
        estado: "En diagnóstico",
        responsable: "Andrés Silva (Técnico)",
        comentario: "Revisión de placa y estado de pantalla táctil.",
      },
      {
        id: 1,
        fecha: "28/09/2026",
        hora: "11:00",
        estado: "Recibida",
        responsable: "Recepción TecnoFix",
        comentario: "Recepción de equipo.",
      },
    ],
  },
  {
    id: "ORD-1015",
    fechaRecepcion: "15/09/2026",
    tipoEquipo: "Impresora",
    marca: "Epson",
    modelo: "EcoTank L3250",
    numeroSerie: "EPS-991204",
    descripcionFalla: "Almohadillas de tinta al límite de su vida útil y líneas en blanco al imprimir.",
    accesorios: "Cable de poder",
    estado: "Entregada",
    diagnosticoTecnico: "Mantenimiento general, reseteo de contador y cambio de almohadillas.",
    presupuesto: {
      manoDeObra: 18000,
      repuestos: 12000,
      total: 30000,
      decisionTomada: "Aprobada",
      fechaDecision: "16/09/2026 09:20",
    },
    bitacora: [
      {
        id: 5,
        fecha: "18/09/2026",
        hora: "17:30",
        estado: "Entregada",
        responsable: "Marcela Díaz (Administradora)",
        comentario: "Equipo entregado conforme al titular con prueba de impresión exitosa.",
      },
      {
        id: 4,
        fecha: "17/09/2026",
        hora: "16:00",
        estado: "Lista para retiro",
        responsable: "Andrés Silva (Técnico)",
        comentario: "Mantenimiento terminado. Se notificó al cliente por correo con bitácora PDF.",
      },
      {
        id: 3,
        fecha: "16/09/2026",
        hora: "10:30",
        estado: "En reparación",
        responsable: "Andrés Silva (Técnico)",
        comentario: "Presupuesto aprobado por el cliente.",
      },
      {
        id: 2,
        fecha: "16/09/2026",
        hora: "09:00",
        estado: "Presupuestada",
        responsable: "Andrés Silva (Técnico)",
        comentario: "Presupuesto emitido.",
      },
      {
        id: 1,
        fecha: "15/09/2026",
        hora: "12:15",
        estado: "Recibida",
        responsable: "Recepción TecnoFix",
        comentario: "Recepción de impresora con cable de alimentación.",
      },
    ],
  },
];

export const TecnoFixClientDashboard: FC<TecnoFixClientDashboardProps> = ({
  user,
  onNavigate,
  onLogout,
}) => {
  const [orders, setOrders] = useState<OrdenReparacion[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrdenReparacion | null>(INITIAL_ORDERS[0]);
  const [filterStatus, setFilterStatus] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modales de Confirmación y Acciones
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    actionType: "Aprobar" | "Rechazar" | null;
    orderId: string | null;
  }>({ isOpen: false, actionType: null, orderId: null });

  // Toast / Alerta global
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manejo de Decisión de Presupuesto (ORD-003)
  const handleDecisionClick = (action: "Aprobar" | "Rechazar", orderId: string) => {
    setConfirmModal({
      isOpen: true,
      actionType: action,
      orderId: orderId,
    });
  };

  const handleConfirmDecision = () => {
    if (!confirmModal.orderId || !confirmModal.actionType) return;

    const { orderId, actionType } = confirmModal;
    const now = new Date();
    const fecha = now.toLocaleDateString("es-CL");
    const hora = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

    const nuevoEstado = actionType === "Aprobar" ? "En reparación" : "Rechazada";
    const decisionTexto = actionType === "Aprobar" ? "Aprobada" : "Rechazada";
    const comentario =
      actionType === "Aprobar"
        ? "El cliente aprobó el presupuesto a través del portal en línea."
        : "El cliente rechazó el presupuesto. El equipo queda disponible para retiro sin reparar.";

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedPresupuesto = ord.presupuesto
            ? {
                ...ord.presupuesto,
                decisionTomada: decisionTexto as "Aprobada" | "Rechazada",
                fechaDecision: `${fecha} ${hora}`,
              }
            : undefined;

          const updatedBitacora: BitacoraItem[] = [
            {
              id: ord.bitacora.length + 1,
              fecha,
              hora,
              estado: nuevoEstado,
              responsable: `${user.nombre} (Cliente)`,
              comentario,
            },
            ...ord.bitacora,
          ];

          const updatedOrder: OrdenReparacion = {
            ...ord,
            estado: nuevoEstado as OrdenReparacion["estado"],
            presupuesto: updatedPresupuesto,
            bitacora: updatedBitacora,
          };

          if (selectedOrder?.id === orderId) {
            setSelectedOrder(updatedOrder);
          }

          return updatedOrder;
        }
        return ord;
      })
    );

    setConfirmModal({ isOpen: false, actionType: null, orderId: null });
    showToast(
      actionType === "Aprobar"
        ? "Presupuesto aprobado exitosamente. La orden pasa a 'En reparación'."
        : "Presupuesto rechazado. Su equipo quedó listo para retiro sin reparar.",
      "success"
    );
  };

  // Filtros
  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === "Todas" || o.estado === filterStatus;
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tipoEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Recibida":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
      case "En diagnóstico":
        return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" };
      case "Presupuestada":
        return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" };
      case "En reparación":
        return { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" };
      case "Lista para retiro":
        return { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0" };
      case "Entregada":
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
      case "Rechazada":
        return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
      default:
        return { bg: "#F1F5F9", text: "#334155", border: "#E2E8F0" };
    }
  };

  const stepsOrder = [
    "Recibida",
    "En diagnóstico",
    "Presupuestada",
    "En reparación",
    "Lista para retiro",
    "Entregada",
  ];

  return (
    <div style={styles.dashboardContainer}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            ...styles.toast,
            background: toastMessage.type === "success" ? "#065F46" : "#f56558",
          }}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header / Navbar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.brandIcon}>
            <TecnoFixGear size={26} />
          </div>
          <div>
            <h1 style={styles.brandTitle}>TecnoFix</h1>
            <span style={styles.brandSubtitle}>Portal de Clientes</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.nombre}</span>
            <span style={styles.userRut}>RUT: {user.rut}</span>
            <span style={styles.userBadge}>Cliente</span>
          </div>

          <button
            type="button"
            title="Ver mis datos personales"
            onClick={() => onNavigate("Mis datos")}
            style={styles.headerBtnSecondary}
          >
            <UserRound size={16} aria-hidden="true" />
            Mis datos
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={styles.headerBtnLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* KPI / Summary Cards */}
        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Total Órdenes</span>
            <span style={styles.kpiValue}>{orders.length}</span>
            <span style={styles.kpiHelp}>Registradas a tu nombre</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>En Proceso</span>
            <span style={{ ...styles.kpiValue, color: "#0284C7" }}>
              {orders.filter((o) => ["Recibida", "En diagnóstico", "En reparación"].includes(o.estado)).length}
            </span>
            <span style={styles.kpiHelp}>En taller o diagnóstico</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Presupuestos por Aprobar</span>
            <span style={{ ...styles.kpiValue, color: "#7C3AED" }}>
              {orders.filter((o) => o.estado === "Presupuestada").length}
            </span>
            <span style={styles.kpiHelp}>Esperando tu decisión</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Listas para Retiro</span>
            <span style={{ ...styles.kpiValue, color: "#16A34A" }}>
              {orders.filter((o) => o.estado === "Lista para retiro").length}
            </span>
            <span style={styles.kpiHelp}>Puedes pasar a retirar</span>
          </div>
        </section>

        {/* Orders Layout (Left List, Right Detail) */}
        <div style={styles.contentLayout}>
          {/* Left: Orders List */}
          <div style={styles.ordersListPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Mis Órdenes de Reparación</h2>
              <span style={styles.countBadge}>{filteredOrders.length}</span>
            </div>

            {/* Filters */}
            <div style={styles.filtersBar}>
              <input
                type="text"
                placeholder="Buscar por N° orden, equipo o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="Todas">Todos los estados</option>
                <option value="Recibida">Recibida</option>
                <option value="En diagnóstico">En diagnóstico</option>
                <option value="Presupuestada">Presupuestada</option>
                <option value="En reparación">En reparación</option>
                <option value="Lista para retiro">Lista para retiro</option>
                <option value="Entregada">Entregada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            {/* Order Cards */}
            <div style={styles.ordersScroll}>
              {filteredOrders.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>No se encontraron órdenes registradas con los filtros seleccionados.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const colors = getStatusColor(ord.estado);
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      style={{
                        ...styles.orderCardItem,
                        borderColor: isSelected ? "#34D399" : "#E2E8F0",
                        boxShadow: isSelected
                          ? "0 4px 14px rgba(52, 211, 153, 0.2)"
                          : "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div style={styles.orderCardHeader}>
                        <span style={styles.orderCardId}>{ord.id}</span>
                        <span
                          style={{
                            ...styles.statusBadge,
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {ord.estado}
                        </span>
                      </div>

                      <div style={styles.orderCardBody}>
                        <h3 style={styles.orderCardTitle}>
                          {ord.tipoEquipo} - {ord.marca} {ord.modelo}
                        </h3>
                        <p style={styles.orderCardFalla} title={ord.descripcionFalla}>
                          {ord.descripcionFalla}
                        </p>
                      </div>

                      <div style={styles.orderCardFooter}>
                        <span style={styles.orderCardDate}>📅 Ingreso: {ord.fechaRecepcion}</span>
                        {ord.estado === "Presupuestada" && (
                          <span style={styles.actionRequiredPill}>¡Acción requerida!</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Order Detail & Tracking (ORD-005 & ORD-003) */}
          <div style={styles.detailPanel}>
            {selectedOrder ? (
              <div>
                <div style={styles.detailHeader}>
                  <div>
                    <span style={styles.detailPreTitle}>Seguimiento en línea</span>
                    <h2 style={styles.detailTitle}>
                      Orden {selectedOrder.id} — {selectedOrder.marca} {selectedOrder.modelo}
                    </h2>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadgeLarge,
                      ...getStatusColor(selectedOrder.estado),
                      border: `1.5px solid ${getStatusColor(selectedOrder.estado).border}`,
                    }}
                  >
                    {selectedOrder.estado}
                  </span>
                </div>

                {/* Progress Tracker (Lifecycle) */}
                {selectedOrder.estado !== "Rechazada" && (
                  <div style={styles.progressTracker}>
                    {stepsOrder.map((step, idx) => {
                      const currentIdx = stepsOrder.indexOf(selectedOrder.estado);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} style={styles.progressStep}>
                          <div
                            style={{
                              ...styles.progressCircle,
                              background: isCompleted ? "#059669" : "#E2E8F0",
                              color: isCompleted ? "#FFFFFF" : "#64748B",
                              border: isCurrent ? "3px solid #34D399" : "none",
                            }}
                          >
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span
                            style={{
                              ...styles.progressStepLabel,
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? "#0F172A" : "#64748B",
                            }}
                          >
                            {step}
                          </span>
                          {idx < stepsOrder.length - 1 && (
                            <div
                              style={{
                                ...styles.progressLine,
                                background: idx < currentIdx ? "#059669" : "#E2E8F0",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Info Grid */}
                <div style={styles.infoSection}>
                  <h4 style={styles.sectionHeading}>📋 Datos del Equipo y Falla</h4>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoBox}>
                      <span style={styles.infoBoxLabel}>Tipo de Equipo</span>
                      <span style={styles.infoBoxValue}>{selectedOrder.tipoEquipo}</span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoBoxLabel}>Marca y Modelo</span>
                      <span style={styles.infoBoxValue}>
                        {selectedOrder.marca} {selectedOrder.modelo}
                      </span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoBoxLabel}>N° de Serie</span>
                      <span style={styles.infoBoxValue}>
                        {selectedOrder.numeroSerie || "No especificado"}
                      </span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoBoxLabel}>Accesorios Entregados</span>
                      <span style={styles.infoBoxValue}>
                        {selectedOrder.accesorios || "Sin accesorios"}
                      </span>
                    </div>
                  </div>

                  <div style={{ ...styles.infoBox, marginTop: 12 }}>
                    <span style={styles.infoBoxLabel}>Falla Reportada por el Cliente</span>
                    <p style={styles.infoBoxText}>{selectedOrder.descripcionFalla}</p>
                  </div>

                  {selectedOrder.diagnosticoTecnico && (
                    <div style={{ ...styles.infoBox, marginTop: 12, background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                      <span style={{ ...styles.infoBoxLabel, color: "#166534" }}>🔬 Diagnóstico Técnico</span>
                      <p style={{ ...styles.infoBoxText, color: "#14532D" }}>{selectedOrder.diagnosticoTecnico}</p>
                    </div>
                  )}
                </div>

                {/* Budget Section (ORD-003) */}
                {selectedOrder.presupuesto && (
                  <div style={styles.budgetCard}>
                    <div style={styles.budgetHeader}>
                      <div>
                        <h4 style={styles.budgetTitle}>💰 Presupuesto de Reparación</h4>
                        <p style={styles.budgetSubtitle}>Desglose de costos emitido por el equipo técnico</p>
                      </div>

                      <div style={styles.budgetTotalBox}>
                        <span style={styles.budgetTotalLabel}>Total a Pagar</span>
                        <span style={styles.budgetTotalNumber}>
                          ${selectedOrder.presupuesto.total.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </div>

                    <div style={styles.budgetDetailsGrid}>
                      <div style={styles.budgetItem}>
                        <span>Mano de obra</span>
                        <strong>${selectedOrder.presupuesto.manoDeObra.toLocaleString("es-CL")}</strong>
                      </div>
                      <div style={styles.budgetItem}>
                        <span>Repuestos e insumos</span>
                        <strong>${selectedOrder.presupuesto.repuestos.toLocaleString("es-CL")}</strong>
                      </div>
                    </div>

                    {/* Decision Buttons for Presupuestada Status */}
                    {selectedOrder.estado === "Presupuestada" && (
                      <div style={styles.budgetActions}>
                        <p style={styles.budgetActionNotice}>
                          ⚠️ Por favor, revise el presupuesto y elija si desea autorizar o rechazar la reparación.
                        </p>
                        <div style={styles.actionBtnGroup}>
                          <button
                            type="button"
                            onClick={() => handleDecisionClick("Aprobar", selectedOrder.id)}
                            style={styles.btnAprobar}
                          >
                            ✓ Aprobar Presupuesto
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDecisionClick("Rechazar", selectedOrder.id)}
                            style={styles.btnRechazar}
                          >
                            ✕ Rechazar Presupuesto
                          </button>
                        </div>
                      </div>
                    )}

                    {/* If decision was already taken */}
                    {selectedOrder.presupuesto.decisionTomada && (
                      <div
                        style={{
                          ...styles.decisionResultBanner,
                          background:
                            selectedOrder.presupuesto.decisionTomada === "Aprobada" ? "#ECFDF5" : "#FEF2F2",
                          color:
                            selectedOrder.presupuesto.decisionTomada === "Aprobada" ? "#065F46" : "#991B1B",
                          borderColor:
                            selectedOrder.presupuesto.decisionTomada === "Aprobada" ? "#A7F3D0" : "#FECACA",
                        }}
                      >
                        <span>
                          Presupuesto <strong>{selectedOrder.presupuesto.decisionTomada}</strong> por el cliente el{" "}
                          {selectedOrder.presupuesto.fechaDecision}.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline / Bitácora (ORD-005) */}
                <div style={styles.bitacoraSection}>
                  <h4 style={styles.sectionHeading}>📜 Bitácora de Eventos (Más reciente al más antiguo)</h4>
                  <div style={styles.timelineList}>
                    {selectedOrder.bitacora.map((item, index) => (
                      <div key={item.id} style={styles.timelineItem}>
                        <div style={styles.timelinePoint} />
                        {index < selectedOrder.bitacora.length - 1 && <div style={styles.timelineBar} />}
                        <div style={styles.timelineContent}>
                          <div style={styles.timelineMeta}>
                            <span style={styles.timelineDate}>
                              {item.fecha} a las {item.hora} hrs
                            </span>
                            <span style={styles.timelineEstado}>{item.estado}</span>
                          </div>
                          <p style={styles.timelineComentario}>{item.comentario}</p>
                          <span style={styles.timelineResp}>👤 Responsable: {item.responsable}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.noOrderSelected}>
                <p>Selecciona una orden de la lista para ver su seguimiento detallado.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMACIÓN (REQ NF01: "¿Está seguro?") */}
      {confirmModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>¿Está seguro?</h3>
            <p style={styles.modalText}>
              {confirmModal.actionType === "Aprobar"
                ? `¿Está seguro de aprobar el presupuesto para la orden ${confirmModal.orderId}? La orden pasará inmediatamente a 'En reparación'.`
                : `¿Está seguro de rechazar el presupuesto para la orden ${confirmModal.orderId}? Su equipo quedará disponible para retiro sin reparar.`}
            </p>
            <p style={{ ...styles.modalSubtext, color: "#f56558" }}>
              * Una vez tomada la decisión, esta no puede modificarse.
            </p>

            <div style={styles.modalButtons}>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, actionType: null, orderId: null })}
                style={styles.btnModalCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                style={{
                  ...styles.btnModalConfirm,
                  background: confirmModal.actionType === "Aprobar" ? "#059669" : "#f56558",
                }}
              >
                Sí, {confirmModal.actionType}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  dashboardContainer: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    display: "flex",
    flexDirection: "column",
  },
  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    color: "#FFFFFF",
    padding: "14px 22px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
    zIndex: 9999,
  },
  header: {
    background: "#0F172A",
    color: "#FFFFFF",
    padding: "16px 36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#34D399",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    minWidth: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 14,
    fontWeight: 700,
  },
  userRut: {
    fontSize: 12,
    color: "#94A3B8",
  },
  userBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    background: "#065F46",
    color: "#34D399",
    padding: "2px 8px",
    borderRadius: 12,
    marginTop: 2,
  },
  headerBtnSecondary: {
    background: "#1E293B",
    color: "#F8FAFC",
    border: "1px solid #334155",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "inherit",
  },
  headerBtnLogout: {
    background: "#334155",
    color: "#F8FAFC",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  main: {
    padding: "28px 36px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  kpiCard: {
    background: "#FFFFFF",
    padding: "20px 24px",
    borderRadius: 16,
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748B",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0F172A",
    marginBottom: 4,
  },
  kpiHelp: {
    fontSize: 11.5,
    color: "#94A3B8",
  },
  contentLayout: {
    display: "grid",
    gridTemplateColumns: "400px 1fr",
    gap: 24,
    alignItems: "start",
  },
  ordersListPanel: {
    background: "#FFFFFF",
    borderRadius: 20,
    border: "1px solid #E2E8F0",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  panelTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#0F172A",
  },
  countBadge: {
    background: "#F1F5F9",
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 10,
  },
  filtersBar: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    outline: "none",
  },
  selectFilter: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 13,
    outline: "none",
    background: "#FFFFFF",
  },
  ordersScroll: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "680px",
    overflowY: "auto",
  },
  orderCardItem: {
    border: "1.5px solid #E2E8F0",
    borderRadius: 14,
    padding: "14px",
    cursor: "pointer",
    background: "#FFFFFF",
    transition: "all 0.15s ease",
  },
  orderCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderCardId: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0F172A",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 8,
  },
  statusBadgeLarge: {
    fontSize: 13,
    fontWeight: 700,
    padding: "6px 14px",
    borderRadius: 10,
  },
  orderCardBody: {
    marginBottom: 10,
  },
  orderCardTitle: {
    margin: "0 0 4px 0",
    fontSize: 14,
    fontWeight: 700,
    color: "#1E293B",
  },
  orderCardFalla: {
    margin: 0,
    fontSize: 12.5,
    color: "#64748B",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  orderCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 11.5,
    color: "#94A3B8",
    borderTop: "1px solid #F1F5F9",
    paddingTop: 8,
  },
  actionRequiredPill: {
    background: "#FDF2F8",
    color: "#BE185D",
    fontWeight: 700,
    fontSize: 10.5,
    padding: "2px 6px",
    borderRadius: 6,
    border: "1px solid #FBCFE8",
  },
  detailPanel: {
    background: "#FFFFFF",
    borderRadius: 20,
    border: "1px solid #E2E8F0",
    padding: "28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: 16,
  },
  detailPreTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  detailTitle: {
    margin: "4px 0 0 0",
    fontSize: 22,
    fontWeight: 800,
    color: "#0F172A",
  },
  progressTracker: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#F8FAFC",
    borderRadius: 14,
    padding: "18px 24px",
    marginBottom: 24,
    border: "1px solid #E2E8F0",
  },
  progressStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    zIndex: 2,
  },
  progressStepLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  progressLine: {
    position: "absolute",
    top: 14,
    left: "50%",
    width: "100%",
    height: 3,
    zIndex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionHeading: {
    margin: "0 0 12px 0",
    fontSize: 15,
    fontWeight: 700,
    color: "#0F172A",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  infoBox: {
    background: "#F8FAFC",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
  },
  infoBoxLabel: {
    display: "block",
    fontSize: 11.5,
    fontWeight: 600,
    color: "#64748B",
    marginBottom: 4,
  },
  infoBoxValue: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#0F172A",
  },
  infoBoxText: {
    margin: 0,
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 1.5,
  },
  budgetCard: {
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 16,
    padding: "20px",
    marginBottom: 24,
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  budgetTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
  },
  budgetSubtitle: {
    margin: "2px 0 0 0",
    fontSize: 12,
    color: "#64748B",
  },
  budgetTotalBox: {
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    padding: "8px 14px",
    textAlign: "right",
  },
  budgetTotalLabel: {
    display: "block",
    fontSize: 11,
    color: "#64748B",
    fontWeight: 600,
  },
  budgetTotalNumber: {
    fontSize: 20,
    fontWeight: 800,
    color: "#059669",
  },
  budgetDetailsGrid: {
    display: "flex",
    gap: 20,
    marginBottom: 16,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 12,
  },
  budgetItem: {
    fontSize: 13.5,
    color: "#475569",
    display: "flex",
    gap: 8,
  },
  budgetActions: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: "16px",
  },
  budgetActionNotice: {
    margin: "0 0 12px 0",
    fontSize: 13,
    color: "#0F172A",
    fontWeight: 600,
  },
  actionBtnGroup: {
    display: "flex",
    gap: 12,
  },
  btnAprobar: {
    flex: 1,
    padding: "12px",
    background: "#059669",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  btnRechazar: {
    flex: 1,
    padding: "12px",
    background: "#EF4444",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  decisionResultBanner: {
    border: "1px solid",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 600,
  },
  bitacoraSection: {
    marginTop: 8,
  },
  timelineList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    paddingLeft: 16,
  },
  timelineItem: {
    position: "relative",
    paddingBottom: 20,
    paddingLeft: 20,
  },
  timelinePoint: {
    position: "absolute",
    left: -6,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#34D399",
    border: "2px solid #059669",
    zIndex: 2,
  },
  timelineBar: {
    position: "absolute",
    left: -1,
    top: 14,
    bottom: 0,
    width: 2,
    background: "#CBD5E1",
    zIndex: 1,
  },
  timelineContent: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "12px 14px",
  },
  timelineMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
  },
  timelineEstado: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#0F172A",
    background: "#E2E8F0",
    padding: "2px 6px",
    borderRadius: 6,
  },
  timelineComentario: {
    margin: "0 0 6px 0",
    fontSize: 13,
    color: "#1E293B",
  },
  timelineResp: {
    fontSize: 11.5,
    color: "#64748B",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15,23,42,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modalBox: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: "28px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
  },
  modalTitle: {
    margin: "0 0 8px 0",
    fontSize: 20,
    fontWeight: 800,
    color: "#0F172A",
  },
  modalText: {
    margin: "0 0 12px 0",
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.5,
  },
  modalSubtext: {
    margin: "0 0 20px 0",
    fontSize: 12.5,
    fontWeight: 600,
  },
  modalButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  },
  btnModalCancel: {
    padding: "10px 18px",
    background: "#F1F5F9",
    color: "#475569",
    border: "none",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnModalConfirm: {
    padding: "10px 18px",
    background: "#059669",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  errorBanner: {
    background: "#FEF2F2",
    color: "#f56558",
    border: "1px solid #FECACA",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12.5,
    fontWeight: 600,
    marginBottom: 14,
  },
  successBanner: {
    background: "#ECFDF5",
    color: "#059669",
    border: "1px solid #A7F3D0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12.5,
    fontWeight: 600,
    marginBottom: 14,
  },
  modalInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #CBD5E1",
    borderRadius: 8,
    fontSize: 13.5,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: 6,
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13.5,
  },
  noOrderSelected: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
  },
};
