import { useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import type { LoginResponse } from "../Api/auth";
import { DashboardLayout } from "./TecnoFixDashboard";
import type { DashboardRole } from "./TecnoFixDashboard";
import TecnoFixChangePassword from "./TecnoFixChangePassword";

interface TecnoFixProfileProps {
  user: LoginResponse;
  role: DashboardRole;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onPasswordChanged: (message: string) => void;
  onSessionExpired: (message: string) => void;
}

export default function TecnoFixProfile({ user, role, onNavigate, onLogout, onPasswordChanged, onSessionExpired }: TecnoFixProfileProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initial = user.name.trim().charAt(0).toLocaleUpperCase("es-CL");

  return (
    <DashboardLayout
      active="Mis datos"
      role={role}
      userName={user.name}
      onNavigate={onNavigate}
      onLogout={onLogout}
      navigationDisabled={isSubmitting}
    >
      <section className="tf-profile" aria-labelledby="tf-profile-title">
        <header className="tf-profileHeader">
          <h1 id="tf-profile-title">Mis datos</h1>
          <button
            className="tf-button tf-profileBack"
            type="button"
            onClick={() => onNavigate("Resumen")}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver al panel
          </button>
        </header>

        <div className="tf-profileIdentity">
          <div className="tf-avatar tf-profileAvatar" aria-hidden="true">{initial}</div>
          <div>
            <h2>{user.name}</h2>
            <span className="tf-profileRole">{role}</span>
          </div>
        </div>

        <dl className="tf-profileDetails">
          <div>
            <dt>Nombre</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Correo electrónico</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{role}</dd>
          </div>
          <div>
            <dt>ID de usuario</dt>
            <dd>{user.userId}</dd>
          </div>
        </dl>

        <div className="tf-profileSecurity">
          {showPasswordForm ? (
            <TecnoFixChangePassword
              onCancel={() => setShowPasswordForm(false)}
              onPasswordChanged={onPasswordChanged}
              onSessionExpired={onSessionExpired}
              isSubmitting={isSubmitting}
              onSubmittingChange={setIsSubmitting}
            />
          ) : (
            <button
              className="tf-button tf-buttonPrimary tf-passwordTrigger"
              type="button"
              onClick={() => setShowPasswordForm(true)}
            >
              <LockKeyhole size={16} aria-hidden="true" />
              Cambiar contraseña
            </button>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
