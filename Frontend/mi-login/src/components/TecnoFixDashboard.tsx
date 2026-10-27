import type { FC, ReactNode } from "react";
import { UserRound } from "lucide-react";
import "./TecnoFixDashboard.css";
import TecnoFixGear from "./TecnoFixGear";

/*
 * Estructura común de las pantallas con sesión iniciada (barra lateral + contenido).
 * El panel inicial muestra «Próximamente» hasta que existan las funcionalidades
 * de órdenes y estadísticas, para no mostrar datos ficticios.
 */

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
    : role === "Administrador" ? ["Resumen", "Órdenes", "Estadísticas", "Técnicos"] : ["Resumen", "Órdenes", "Mis tareas"];

  return (
    <div className="tf-dashboard">
      <div className="tf-shell">
        <aside className="tf-sidebar">
          <div className="tf-brand">
            <div className="tf-brandIcon"><TecnoFixGear size={26} /></div>
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
                <span className="tf-navIcon">{item === "Resumen" ? "▣" : item === "Órdenes" ? "▤" : item === "Técnicos" ? "⚒" : "◷"}</span>
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

interface DashboardProps {
  userName: string;
  role: DashboardRole;
  active?: string;
  onNavigate?: (label: string) => void;
  onLogout?: () => void;
}

const TecnoFixDashboard: FC<DashboardProps> = ({ userName, role, active = "Resumen", onNavigate, onLogout }) => (
  <DashboardLayout active={active} role={role} userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
    <section className="tf-comingSoon" aria-labelledby="tf-comingSoon-title">
      <h1 id="tf-comingSoon-title">Próximamente</h1>
      <p>Esta sección estará disponible en una próxima versión.</p>
    </section>
  </DashboardLayout>
);

export default TecnoFixDashboard;
