import type { Dispatch, FC, ReactNode, SetStateAction } from "react";

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

const dashboardStyles = `
  body { margin: 0; background: #E2E8F0; }
  .tf-dashboard, .tf-dashboard * { box-sizing: border-box; }
  .tf-dashboard {
    --tf-ink: #0F172A;
    --tf-muted: #64748B;
    --tf-soft: #94A3B8;
    --tf-line: #E2E8F0;
    --tf-surface: #FFFFFF;
    --tf-canvas: #F1F5F9;
    --tf-green: #10B981;
    --tf-green-dark: #065F46;
    --tf-green-deep: #064E3B;
    --tf-sky: #0EA5E9;
    height: 100vh;
    padding: 14px;
    overflow: hidden;
    color: var(--tf-ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .tf-shell {
    height: 100%;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 0;
    background: var(--tf-surface);
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15, 23, 42, .12);
  }

  /* ---------- Sidebar (clara) ---------- */
  .tf-sidebar {
    height: 100%;
    min-height: 0;
    padding: 20px 18px 16px;
    background: var(--tf-surface);
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
  }
  .tf-brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; }
  .tf-brandIcon {
    width: 38px; height: 38px; border-radius: 12px;
    display: grid; place-items: center;
    background: linear-gradient(135deg, #34D399, var(--tf-sky));
    color: #082F49; font-size: 20px;
  }
  .tf-brandTitle { font-size: 20px; font-weight: 800; color: var(--tf-ink); line-height: 1.1; letter-spacing: -0.02em; }
  .tf-brandText { margin-top: 2px; color: var(--tf-soft); font-size: 11px; }
  .tf-navGroup { display: grid; gap: 4px; }
  .tf-navLabel { padding: 0 12px; margin-bottom: 6px; color: var(--tf-soft); font-size: 12px; font-weight: 600; }
  .tf-navButton {
    position: relative;
    width: 100%; border: 0; border-radius: 12px;
    background: transparent; color: var(--tf-muted);
    display: flex; align-items: center; gap: 12px;
    padding: 11px 12px; font: inherit; font-size: 14px; font-weight: 600;
    text-align: left; cursor: pointer;
  }
  .tf-navButton:hover { background: var(--tf-canvas); color: var(--tf-ink); }
  .tf-navButton.is-active { color: var(--tf-green-dark); font-weight: 800; }
  .tf-navButton.is-active::before {
    content: ""; position: absolute; left: -20px; top: 8px; bottom: 8px;
    width: 5px; border-radius: 0 6px 6px 0; background: var(--tf-green-dark);
  }
  .tf-navButton:focus-visible, .tf-button:focus-visible { outline: 2px solid var(--tf-green); outline-offset: 2px; }
  .tf-navIcon { width: 20px; text-align: center; font-size: 15px; }

  .tf-sidebarFooter {
    margin-top: auto;
    border-radius: 24px;
    padding: 18px;
    color: #ECFDF5;
    background:
      radial-gradient(circle at 85% 110%, rgba(52, 211, 153, .55) 0, transparent 55%),
      linear-gradient(160deg, #0F172A 0%, var(--tf-green-deep) 100%);
  }
  .tf-sidebarFooter .tf-footerIcon {
    width: 34px; height: 34px; border-radius: 50%;
    display: grid; place-items: center;
    background: rgba(255,255,255,.14); margin-bottom: 14px; font-size: 16px;
  }
  .tf-sidebarFooter strong { display: block; color: #FFFFFF; font-size: 15px; margin-bottom: 2px; }
  .tf-sidebarFooter span { color: #A7F3D0; font-size: 12px; }
  .tf-sidebarFooter .tf-button {
    margin-top: 14px; width: 100%; border: 0;
    background: var(--tf-green); color: #052E1C;
  }

  /* ---------- Contenido ---------- */
  .tf-page { min-width: 0; min-height: 0; overflow: hidden; height: 100%; padding: 14px 16px 14px 6px; background: var(--tf-surface); }
  .tf-canvas { background: var(--tf-canvas); border-radius: 26px; padding: 16px 18px; height: 100%; display: flex; flex-direction: column; min-height: 0; }
  .tf-topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 10px; }
  .tf-search {
    flex: 1; max-width: 340px; height: 40px;
    display: flex; align-items: center; gap: 10px;
    border-radius: 999px; background: var(--tf-surface);
    padding: 0 16px; color: var(--tf-soft); font-size: 14px;
  }
  .tf-search input { flex: 1; border: 0; outline: 0; background: transparent; font: inherit; color: var(--tf-ink); min-width: 0; }
  .tf-search kbd { font: inherit; font-size: 11px; background: var(--tf-canvas); border-radius: 6px; padding: 2px 6px; }
  .tf-userBox { display: flex; align-items: center; gap: 12px; }
  .tf-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: grid; place-items: center;
    background: #DCFCE7; color: #047857; font-weight: 900;
  }
  .tf-userName { font-weight: 800; font-size: 14px; white-space: nowrap; }
  .tf-userRole { color: var(--tf-muted); font-size: 12px; }

  .tf-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
  .tf-title { margin: 0; font-size: clamp(20px, 2.2vw, 26px); letter-spacing: -0.03em; line-height: 1.1; font-weight: 800; }
  .tf-subtitle { margin: 4px 0 0; color: var(--tf-muted); font-size: 13px; line-height: 1.5; max-width: 560px; }

  .tf-cardGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
  .tf-card, .tf-panel { background: var(--tf-surface); border-radius: 24px; }
  .tf-card { padding: 12px 16px; }
  .tf-card.is-featured {
    color: #FFFFFF;
    background:
      radial-gradient(circle at 100% 0, rgba(52, 211, 153, .45) 0, transparent 55%),
      linear-gradient(150deg, var(--tf-green-dark) 0%, var(--tf-green-deep) 100%);
  }
  .tf-cardTop { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .tf-cardLabel { font-size: 13px; font-weight: 700; }
  .tf-card:not(.is-featured) .tf-cardLabel { color: var(--tf-ink); }
  .tf-cardIcon {
    width: 28px; height: 28px; border-radius: 50%;
    display: grid; place-items: center; font-size: 13px;
    border: 1px solid var(--tf-line); background: var(--tf-surface);
  }
  .tf-card.is-featured .tf-cardIcon { background: #FFFFFF; border-color: #FFFFFF; }
  .tf-cardValue { display: block; margin-top: 2px; font-size: 28px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
  .tf-cardHint { display: inline-block; margin-top: 4px; color: var(--tf-soft); font-size: 11.5px; }
  .tf-card.is-featured .tf-cardHint {
    color: #A7F3D0; background: rgba(255,255,255,.12);
    border-radius: 6px; padding: 3px 8px;
  }

  .tf-mainGrid { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 12px; align-items: stretch; }
  .tf-panel { overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
  .tf-panelHeader {
    display: flex; justify-content: space-between; align-items: center; gap: 14px;
    padding: 14px 20px 8px;
  }
  .tf-panelHeader h2, .tf-panelHeader h3 { margin: 0; font-size: 17px; font-weight: 800; }
  .tf-panelHeader p { margin: 4px 0 0; color: var(--tf-muted); font-size: 13px; }
  .tf-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .tf-button {
    border: 1px solid #CBD5E1; border-radius: 999px;
    background: var(--tf-surface); color: var(--tf-ink);
    padding: 8px 16px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  }
  .tf-buttonPrimary { background: var(--tf-green-dark); border-color: var(--tf-green-dark); color: #FFFFFF; }
  .tf-buttonGhost { color: var(--tf-green-dark); border-color: var(--tf-green-dark); background: transparent; }
  .tf-buttonSmall { padding: 7px 14px; font-size: 12px; }
  .tf-button:disabled, .tf-input:disabled, .tf-search input:disabled { opacity: .6; cursor: not-allowed; }

  .tf-tableWrap { flex: 1; min-height: 0; overflow: auto; padding: 0 10px 8px; }
  .tf-table { width: 100%; border-collapse: collapse; min-width: 780px; }
  .tf-table th {
    padding: 8px 10px; color: var(--tf-soft); font-size: 12px; font-weight: 700; white-space: nowrap;
    text-align: left; position: sticky; top: 0; background: var(--tf-surface); border-bottom: 1px solid var(--tf-line);
  }
  .tf-table td { padding: 6px 10px; white-space: nowrap; font-size: 13px; border-bottom: 1px solid var(--tf-canvas); vertical-align: middle; }
  .tf-table tr:last-child td { border-bottom: 0; }
  .tf-orderId { font-weight: 800; }
  .tf-device { color: var(--tf-muted); font-size: 12px; margin-top: 1px; }
  .tf-status {
    display: inline-flex; align-items: center; gap: 7px;
    border-radius: 999px; padding: 4px 10px;
    font-size: 11.5px; font-weight: 800; white-space: nowrap;
  }
  .tf-statusDot { width: 7px; height: 7px; border-radius: 50%; }
  .tf-muted { color: var(--tf-soft); }
  .tf-empty { padding: 28px; text-align: center; color: var(--tf-soft); }

  .tf-sideStack { min-height: 0; display: flex; flex-direction: column; gap: 12px; }
  .tf-sideStack .tf-panel { flex: 1; overflow-y: auto; }
  .tf-filters { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 20px; }
  .tf-filters .tf-input { min-width: 0; width: 100%; min-height: 34px; }
  .tf-filters .tf-button { grid-column: 1 / -1; }
  .tf-input {
    min-height: 38px; border: 1px solid #CBD5E1; border-radius: 999px;
    background: var(--tf-surface); padding: 0 12px; color: var(--tf-ink); font: inherit; font-size: 13px;
  }

  /* Gráfico vertical por estado */
  .tf-barChart { padding: 10px 20px 4px; display: flex; align-items: flex-end; justify-content: space-between; gap: 6px; height: 124px; flex: none; }
  .tf-barCol { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%; }
  .tf-barCount { font-size: 12px; font-weight: 800; color: var(--tf-muted); }
  .tf-barTrack { width: 100%; max-width: 22px; flex: 1; display: flex; align-items: flex-end; }
  .tf-bar { width: 100%; border-radius: 8px; min-height: 8px; }
  .tf-bar.is-muted {
    background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.7) 0 2px, transparent 2px 6px) !important;
    opacity: .55;
  }
  .tf-barLabel { font-size: 11px; color: var(--tf-soft); font-weight: 600; text-align: center; }
  .tf-barLabel strong { display: block; font-size: 12px; color: var(--tf-ink); font-weight: 800; }

  /* Donut de entregadas */
  .tf-donutWrap { display: flex; align-items: center; gap: 14px; padding: 6px 20px 4px; }
  .tf-donut {
    --pct: 0;
    width: 72px; height: 72px; border-radius: 50%; flex: none;
    display: grid; place-items: center;
    background: conic-gradient(var(--tf-green-dark) calc(var(--pct) * 1%), #D1FAE5 0);
  }
  .tf-donut span {
    width: 52px; height: 52px; border-radius: 50%; background: var(--tf-surface);
    display: grid; place-items: center; font-size: 16px; font-weight: 800; letter-spacing: -0.03em;
  }
  .tf-donutText strong { display: block; font-size: 14px; }
  .tf-donutText span { color: var(--tf-muted); font-size: 12px; line-height: 1.4; }

  .tf-statList { padding: 8px 20px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .tf-statItem:first-child { grid-column: 1 / -1; }
  .tf-statItem { border-radius: 14px; padding: 8px 12px; display: grid; gap: 2px; background: var(--tf-canvas); }
  .tf-statItem span { color: var(--tf-muted); font-size: 12px; font-weight: 700; }
  .tf-statItem strong { font-size: 13px; line-height: 1.4; }

  @media (max-height: 820px) {
    .tf-subtitle, .tf-cardHint { display: none; }
    .tf-table td { padding: 4px 10px; }
    .tf-card { padding: 10px 16px; }
  }
  @media (max-width: 1180px) {
    .tf-dashboard { height: auto; min-height: 100vh; overflow: visible; }
    .tf-shell, .tf-page, .tf-canvas { height: auto; }
    .tf-mainGrid { flex: none; }
    .tf-sideStack .tf-panel { overflow: visible; }
    .tf-cardGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .tf-mainGrid { grid-template-columns: 1fr; }
  }
  @media (max-width: 900px) {
    .tf-dashboard { padding: 0; }
    .tf-shell { grid-template-columns: 1fr; border-radius: 0; min-height: 100vh; }
    .tf-sidebar { position: static; height: auto; padding: 18px; }
    .tf-navButton.is-active::before { display: none; }
    .tf-navGroup { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .tf-navLabel { grid-column: 1 / -1; }
    .tf-sidebarFooter { display: none; }
    .tf-page { padding: 0 12px 12px; }
    .tf-canvas { padding: 16px; }
  }
  @media (max-width: 640px) {
    .tf-cardGrid { grid-template-columns: 1fr; }
    .tf-navGroup { grid-template-columns: 1fr; }
    .tf-topbar { flex-wrap: wrap; }
    .tf-search { max-width: none; }
    .tf-panelHeader { align-items: flex-start; flex-direction: column; }
  }
`;

interface DashboardLayoutProps {
  children: ReactNode;
  active: string;
  role: "Administrador" | "Técnico";
  userName: string;
  onNavigate?: (label: string) => void;
  onLogout?: () => void;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children, active, role, userName, onNavigate, onLogout }) => {
  const navItems = role === "Administrador" ? ["Resumen", "Órdenes", "Estadísticas"] : ["Resumen", "Órdenes", "Mis tareas"];

  return (
    <div className="tf-dashboard">
      <style>{dashboardStyles}</style>

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
              >
                <span className="tf-navIcon">{item === "Resumen" ? "▣" : item === "Órdenes" ? "▤" : "◷"}</span>
                {item}
              </button>
            ))}
          </nav>

          <div className="tf-sidebarFooter">
            <div className="tf-footerIcon">👤</div>
            <strong>{userName}</strong>
            <span>{role}</span>
            <button className="tf-button tf-buttonSmall" type="button" onClick={onLogout} title="Cerrar sesión">
              Cerrar sesión
            </button>
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
                <div className="tf-donut" style={{ ["--pct" as string]: deliveredPct }}>
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