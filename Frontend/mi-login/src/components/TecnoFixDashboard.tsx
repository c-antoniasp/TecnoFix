import type { CSSProperties, Dispatch, FC, ReactNode, SetStateAction } from "react";
import { UserRound } from "lucide-react";
import "./TecnoFixDashboard.css";

/*
 * TecnoFixDashboard — Solo UI, no es funcional.
 */

export type OrderStatus =
  | "Recibida"
  | "En diagnóstico"
  | "Presupuestada"
  | "En reparación"
  | "Lista para retiro"
  | "Entregada"
  | "Rechazada";

export interface Order {
  id: string;
  client: string;
  type: string;
  device: string;
  technician: string;
  status: OrderStatus;
  date: string;
  serial?: string;
  fault?: string;
  acc?: string;
  diag?: string;
  labor?: number;
  parts?: number;
  decision?: "Aprobado" | "Rechazado";
  deliveredDate?: string;
  taker?: string;
}

export interface Activity {
  text: string;
  by: string;
  time: string;
  comment?: string;
}

export interface DashboardProps {
  userName?: string;
  role?: "Administrador" | "Técnico";
  active?: string;
  clients?: string[];
  orders?: Order[];
  setOrders?: Dispatch<SetStateAction<Order[]>>;
  acts?: Activity[];
  setActs?: Dispatch<SetStateAction<Activity[]>>;
  onNavigate?: (label: string) => void;
  onLogout?: () => void;
}

const orderStatuses: OrderStatus[] = [
  "Recibida",
  "En diagnóstico",
  "Presupuestada",
  "En reparación",
  "Lista para retiro",
  "Entregada",
  "Rechazada",
];

const statusShortLabels = ["Rec", "Diag", "Pres", "Rep", "Lista", "Ent", "Rech"];

const statusColors: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  Recibida: { bg: "#E2E8F0", text: "#334155", dot: "#64748B" },
  "En diagnóstico": { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Presupuestada: { bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6" },
  "En reparación": { bg: "#EDE9FE", text: "#6D28D9", dot: "#8B5CF6" },
  "Lista para retiro": { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  Entregada: { bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  Rechazada: { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

const progressColors = ["#94A3B8", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#22C55E", "#EF4444"];

export const errorColor = "#f56558";

const getRowAction = (order: Order, role: "Administrador" | "Técnico"): [string, string] | undefined => {
  const isTechnician = role === "Técnico";

  // ORD-002: solo el Técnico, con órdenes "Recibida" o "En diagnóstico".
  if (isTechnician && (order.status === "Recibida" || order.status === "En diagnóstico")) {
    return ["Diagnosticar", "Registrar diagnóstico y presupuesto"];
  }

  // ORD-004: solo el Técnico, cuando la reparación ya fue aprobada.
  if (isTechnician && order.status === "En reparación") {
    return ["Actualizar", "Avanzar el estado de la orden e ingresar un comentario del avance"];
  }

  // ORD-006: Técnico y Administrador, con órdenes listas o rechazadas.
  if (order.status === "Lista para retiro" || order.status === "Rechazada") {
    return ["Entregar", "Registrar la entrega del equipo"];
  }

  return undefined;
};

export type ModalType = "new" | "diagnosis" | "updateStatus" | "delivery";

export interface FormField {
  key: string;
  label: string;
  required?: boolean;
  options?: string[];
  multiline?: boolean;
  numeric?: boolean;
}

// Datos de ejemplo, se debe reemplazar al implementar la API.
export const deviceTypes = ["Notebook", "Impresora", "Teléfono", "Tablet", "PC de escritorio", "Consola"];

export const formFields: Record<ModalType, FormField[]> = {
  new: [
    { key: "client", label: "Cliente", required: true, options: [] },
    { key: "type", label: "Tipo de equipo", required: true, options: deviceTypes },
    { key: "device", label: "Marca y modelo", required: true },
    { key: "serial", label: "Número de serie" },
    { key: "fault", label: "Descripción de la falla reportada", required: true, multiline: true },
    { key: "acc", label: "Accesorios entregados" },
  ],
  diagnosis: [
    { key: "diag", label: "Diagnóstico técnico", required: true, multiline: true },
    { key: "labor", label: "Costo de mano de obra", required: true, numeric: true },
    { key: "parts", label: "Costo de repuestos", required: true, numeric: true },
  ],
  updateStatus: [
    { key: "status", label: "Nuevo estado", required: true, options: [] },
    { key: "comment", label: "Comentario del avance", required: true, multiline: true },
  ],
  delivery: [
    { key: "taker", label: "Nombre de quien retira el equipo", required: true },
    { key: "obs", label: "Observaciones" },
  ],
};

export const modalTitles: Record<ModalType, string> = {
  new: "Registrar orden de reparación",
  diagnosis: "Diagnóstico y presupuesto",
  updateStatus: "Actualizar estado de la orden",
  delivery: "Registrar entrega del equipo",
};

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------
export const ORDERS0: Order[] = [
  { id: "ORD-1042", client: "María González", type: "Notebook", device: "Lenovo IdeaPad", technician: "Carlos Rojas", status: "En diagnóstico", date: "2026-09-26" },
  { id: "ORD-1041", client: "Pedro Soto", type: "Teléfono", device: "iPhone 13", technician: "Ana Muñoz", status: "En reparación", date: "2026-09-25", labor: 30000, parts: 45000, decision: "Aprobado" },
  { id: "ORD-1040", client: "Lucía Fernández", type: "PC de escritorio", device: "Gamer Ryzen 5", technician: "Carlos Rojas", status: "Presupuestada", date: "2026-09-25", labor: 25000, parts: 60000 },
  { id: "ORD-1039", client: "Diego Vargas", type: "Teléfono", device: "Samsung S22", technician: "Ana Muñoz", status: "Lista para retiro", date: "2026-09-24", labor: 20000, parts: 15000, decision: "Aprobado" },
  { id: "ORD-1038", client: "Camila Torres", type: "Notebook", device: "MacBook Air M1", technician: "Carlos Rojas", status: "Entregada", date: "2026-09-21", labor: 40000, parts: 35000, decision: "Aprobado", deliveredDate: "2026-09-25", taker: "Camila Torres" },
  { id: "ORD-1037", client: "Javier Pinto", type: "Consola", device: "PS5", technician: "Ana Muñoz", status: "Rechazada", date: "2026-09-22", labor: 15000, parts: 90000, decision: "Rechazado" },
  { id: "ORD-1036", client: "Sofía Araya", type: "Tablet", device: "Samsung Tab S7", technician: "Carlos Rojas", status: "Recibida", date: "2026-09-21" },
  { id: "ORD-1035", client: "Matías Lagos", type: "Notebook", device: "HP Pavilion", technician: "Ana Muñoz", status: "Presupuestada", date: "2026-09-20", labor: 18000, parts: 22000 },
];

// La bitácora pertenece al detalle de cada orden, pero se conserva por compatibilidad.
export const ACT0: Activity[] = [
  { text: "ORD-1039 pasó a Lista para retiro", by: "Ana Muñoz", time: "Hace 1 h", comment: "Reparación finalizada" },
  { text: "ORD-1040 presupuestada", by: "Carlos Rojas", time: "Hace 3 h" },
];

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formatDate = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getOrderTotal = (order: Order) => (order.labor ?? 0) + (order.parts ?? 0);

const daysBetween = (start: string, end: string) => {
  const startDate = new Date(start + "T00:00:00").getTime();
  const endDate = new Date(end + "T00:00:00").getTime();
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
};

const getTechnicianSummary = (orders: Order[]) => {
  const summary = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.technician] = (acc[order.technician] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(summary)
    .map(([name, total]) => `${name}: ${total}`)
    .join(" · ");
};

export type DashboardRole = "Administrador" | "Técnico" | "Cliente";

interface DashboardLayoutProps {
  children: ReactNode;
  active: string;
  role: DashboardRole;
  userName: string;
  onNavigate?: (label: string) => void;
  onLogout?: () => void;
  navigationDisabled?: boolean;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children, active, role, userName, onNavigate, onLogout, navigationDisabled = false }) => {
  const navItems = role === "Cliente"
    ? ["Resumen"]
    : role === "Administrador" ? ["Resumen", "Órdenes", "Estadísticas"] : ["Resumen", "Órdenes", "Mis tareas"];

  return (
    <div className="tf-dashboard">
      <div className="tf-shell">
        <aside className="tf-sidebar">
          <div className="tf-brand">
            <div className="tf-brandIcon">⚙</div>
            <div>
              <div className="tf-brandTitle">TecnoFix</div>
              <div className="tf-brandText">Gestión de reparaciones</div>
            </div>
          </div>

          <nav className="tf-navGroup" aria-label="Navegación del dashboard">
            <div className="tf-navLabel">Menú</div>
            {navItems.map((item) => (
              <button
                key={item}
                className={`tf-navButton ${active === item ? "is-active" : ""}`}
                type="button"
                title={`Ir a ${item}`}
                onClick={() => onNavigate?.(item)}
                disabled={navigationDisabled}
              >
                <span className="tf-navIcon">{item === "Resumen" ? "▣" : item === "Órdenes" ? "▤" : "◷"}</span>
                {item}
              </button>
            ))}
          </nav>

          <div className="tf-sidebarFooter">
            <div className="tf-footerIcon" aria-hidden="true"><UserRound size={18} /></div>
            <div className="tf-footerIdentity">
              <strong>{userName}</strong>
              <span>{role}</span>
            </div>
            <div className="tf-footerActions">
              <button
                className={`tf-button tf-buttonSmall tf-profileButton ${active === "Mis datos" ? "is-active" : ""}`}
                type="button"
                onClick={() => onNavigate?.("Mis datos")}
                disabled={navigationDisabled}
                aria-current={active === "Mis datos" ? "page" : undefined}
                title="Ver mis datos personales"
              >
                <UserRound size={16} aria-hidden="true" />
                Mis datos
              </button>
              <button className="tf-button tf-buttonSmall" type="button" onClick={onLogout} title="Cerrar sesión" disabled={navigationDisabled}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <main className="tf-page">
          <div className="tf-canvas">{children}</div>
        </main>
      </div>
    </div>
  );
};

const TecnoFixDashboard: FC<DashboardProps> = ({
  userName = "Administrador",
  role = "Administrador",
  active = "Resumen",
  orders = ORDERS0,
  onNavigate,
  onLogout,
}) => {
  const isAdmin = role === "Administrador";
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter((order) => ["Recibida", "En diagnóstico", "Presupuestada", "En reparación"].includes(order.status)).length;
  const readyOrders = orders.filter((order) => order.status === "Lista para retiro").length;
  const deliveredOrders = orders.filter((order) => order.status === "Entregada");
  const approvedBudgets = orders.filter((order) => order.decision === "Aprobado").length;
  const rejectedBudgets = orders.filter((order) => order.decision === "Rechazado").length;
  const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const deliveredDays = deliveredOrders.filter((order) => order.deliveredDate).map((order) => daysBetween(order.date, order.deliveredDate!));
  const averageDays = deliveredDays.length ? Math.round(deliveredDays.reduce((sum, days) => sum + days, 0) / deliveredDays.length) : 0;
  const statusTotals = orderStatuses.map((status) => orders.filter((order) => order.status === status).length);
  const maxStatusCount = Math.max(...statusTotals, 1);
  const deliveredPct = totalOrders ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0;

  const summaryCards = [
    { label: "Órdenes totales", value: totalOrders, hint: "registradas en la maqueta", icon: "🧾" },
    { label: "En proceso", value: inProgressOrders, hint: "requieren seguimiento", icon: "🛠️" },
    { label: "Listas para retiro", value: readyOrders, hint: "pueden entregarse", icon: "📦" },
    { label: "Entregadas", value: deliveredOrders.length, hint: "cerradas correctamente", icon: "✅" },
  ];

  const statisticsRows = [
    { label: "Órdenes por técnico responsable", value: getTechnicianSummary(orders) || "—" },
    { label: "Presupuestos aprobados", value: approvedBudgets.toString() },
    { label: "Presupuestos rechazados", value: rejectedBudgets.toString() },
    { label: "Tiempo promedio de atención", value: averageDays ? `${averageDays} días` : "—" },
    { label: "Monto total facturado", value: deliveredRevenue ? money.format(deliveredRevenue) : "—" },
  ];

  return (
    <DashboardLayout active={active} role={role} userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <section className="tf-topbar">
        <label className="tf-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" placeholder="Buscar orden" title="Buscar una orden" disabled />
          <kbd>⌘F</kbd>
        </label>

        <div className="tf-userBox">
          <div className="tf-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="tf-userName">{userName}</div>
            <div className="tf-userRole">{role}</div>
          </div>
        </div>
      </section>

      <section className="tf-hero">
        <div>
          <h1 className="tf-title">Órdenes de reparación</h1>
          <p className="tf-subtitle">
            Revisa el estado de los equipos y las acciones disponibles según tu rol.
          </p>
        </div>
        <div className="tf-actions">
          <button className="tf-button tf-buttonPrimary" type="button" title="Registrar la recepción de un equipo" disabled>
            + Nueva orden
          </button>
        </div>
      </section>

      <section className="tf-cardGrid" aria-label="Resumen de órdenes">
        {summaryCards.map((card, index) => (
          <article className={`tf-card ${index === 0 ? "is-featured" : ""}`} key={card.label}>
            <div className="tf-cardTop">
              <span className="tf-cardLabel">{card.label}</span>
              <span className="tf-cardIcon" aria-hidden="true">{card.icon}</span>
            </div>
            <strong className="tf-cardValue">{card.value}</strong>
            <span className="tf-cardHint">{card.hint}</span>
          </article>
        ))}
      </section>

      <section className="tf-mainGrid">
        <article className="tf-panel" id="sec-ord">
          <header className="tf-panelHeader">
            <div>
              <h2>Listado de órdenes</h2>
              <p>Acciones visibles según rol y estado de la orden.</p>
            </div>
          </header>

          <div className="tf-tableWrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Equipo</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const action = getRowAction(order, role);
                  const colors = statusColors[order.status];

                  return (
                    <tr key={order.id}>
                      <td><span className="tf-orderId">{order.id}</span></td>
                      <td>{order.client}</td>
                      <td>
                        <strong>{order.type}</strong>
                        <div className="tf-device">{order.device}</div>
                      </td>
                      <td>{order.technician}</td>
                      <td>
                        <span className="tf-status" style={{ background: colors.bg, color: colors.text }}>
                          <span className="tf-statusDot" style={{ background: colors.dot }} />
                          {order.status}
                        </span>
                      </td>
                      <td className="tf-muted">{formatDate(order.date)}</td>
                      <td>
                        {action ? (
                          <button className="tf-button tf-buttonGhost tf-buttonSmall" type="button" title={action[1]} disabled>
                            {action[0]}
                          </button>
                        ) : (
                          <span className="tf-muted">{order.status === "Presupuestada" ? "Espera al cliente" : "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="tf-empty">No hay órdenes registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="tf-sideStack">
          {isAdmin && (
            <article className="tf-panel" id="sec-est">
              <header className="tf-panelHeader">
                <div>
                  <h3>Estadísticas</h3>
                  <p>Solo visible para Administrador.</p>
                </div>
              </header>

              <div className="tf-filters">
                <input className="tf-input" type="date" title="Fecha de inicio según fecha de recepción" disabled />
                <input className="tf-input" type="date" title="Fecha de término" disabled />
                <button className="tf-button tf-buttonPrimary tf-buttonSmall" type="button" title="Exportar el resultado de la consulta a PDF" disabled>
                  Exportar PDF
                </button>
              </div>

              <div className="tf-barChart" aria-label="Cantidad de órdenes por estado">
                {orderStatuses.map((status, index) => {
                  const total = statusTotals[index];
                  const height = `${Math.max(8, (total / maxStatusCount) * 100)}%`;

                  return (
                    <div className="tf-barCol" key={status} title={status}>
                      <div className="tf-barTrack">
                        <div
                          className={`tf-bar ${total === maxStatusCount ? "" : "is-muted"}`}
                          style={{ height, background: progressColors[index] }}
                        />
                      </div>
                      <span className="tf-barLabel"><strong>{total}</strong>{statusShortLabels[index]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="tf-donutWrap">
                <div className="tf-donut" style={{ "--pct": deliveredPct } as CSSProperties}>
                  <span>{deliveredPct}%</span>
                </div>
                <div className="tf-donutText">
                  <strong>Órdenes entregadas</strong>
                  <span>{deliveredOrders.length} de {totalOrders} órdenes registradas</span>
                </div>
              </div>

              <div className="tf-statList">
                {statisticsRows.map((row) => (
                  <div className="tf-statItem" key={row.label}>
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          )}

        </aside>
      </section>
    </DashboardLayout>
  );
};

export default TecnoFixDashboard;
