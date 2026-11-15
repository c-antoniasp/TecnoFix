import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../Api/auth";
import type { ChangePasswordRequest } from "../Api/auth";
import { ApiError } from "../Api/client";
import ConfirmationDialog from "./ConfirmationDialog";

interface TecnoFixChangePasswordProps {
  onCancel: () => void;
  onPasswordChanged: (message: string) => void;
  onSessionExpired: (message: string) => void;
  isSubmitting: boolean;
  onSubmittingChange: (submitting: boolean) => void;
}

const passwordFields = [
  { name: "currentPassword", label: "Contraseña actual", visibilityLabel: "contraseña actual", autoComplete: "current-password" },
  { name: "newPassword", label: "Nueva contraseña", visibilityLabel: "nueva contraseña", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirmar nueva contraseña", visibilityLabel: "confirmación de nueva contraseña", autoComplete: "new-password" },
] as const;

export default function TecnoFixChangePassword({ onCancel, onPasswordChanged, onSessionExpired, isSubmitting, onSubmittingChange }: TecnoFixChangePasswordProps) {
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Partial<Record<keyof ChangePasswordRequest, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (controller.current || isConfirmationOpen) return;

    setRequestError("");
    const currentPassword = event.currentTarget.elements.namedItem("currentPassword") as HTMLInputElement;
    if (!currentPassword.value.trim()) {
      setCurrentPasswordError("Debe completar el campo contraseña actual.");
      currentPassword.focus();
      return;
    }

    setIsConfirmationOpen(true);
  };

  const handleConfirm = async () => {
    const form = formRef.current;
    if (!form || !isConfirmationOpen || controller.current) return;

    setIsConfirmationOpen(false);
    // Las contraseñas viven en los campos, nunca en la sesión ni en almacenamiento.
    const data = new FormData(form);
    const request: ChangePasswordRequest = {
      currentPassword: String(data.get("currentPassword") ?? ""),
      newPassword: String(data.get("newPassword") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    };
    const abortController = new AbortController();
    controller.current = abortController;
    setVisiblePasswords({});
    onSubmittingChange(true);
    try {
      const response = await changePassword(request, abortController.signal);
      if (abortController.signal.aborted) return;
      form.reset();
      onPasswordChanged(response.message || "Contraseña actualizada correctamente.");
    } catch (error) {
      if (abortController.signal.aborted) return;
      if (error instanceof ApiError && (error.status === 401 || error.status === 409)) {
        form.reset();
        onSessionExpired(error.message);
      } else {
        setRequestError(error instanceof ApiError
          ? error.message
          : "No se pudo conectar con el servidor. Inténtelo nuevamente.");
      }
    } finally {
      controller.current = null;
      if (!abortController.signal.aborted) onSubmittingChange(false);
    }
  };

  return (
    <form ref={formRef} className="tf-passwordForm" onSubmit={handleSubmit} noValidate aria-labelledby="tf-password-title" aria-busy={isSubmitting}>
      <h2 id="tf-password-title">Cambiar contraseña</h2>
      {requestError && <p className="tf-passwordRequestError" role="alert">{requestError}</p>}
      <fieldset disabled={isSubmitting}>
        {passwordFields.map(field => (
          <div className="tf-passwordField" key={field.name}>
            <label htmlFor={`tf-${field.name}`}>{field.label}</label>
            <div className="tf-passwordInput">
              <input
                className="tf-input"
                id={`tf-${field.name}`}
                name={field.name}
                type={visiblePasswords[field.name] ? "text" : "password"}
                autoComplete={field.autoComplete}
                required
                autoFocus={field.name === "currentPassword"}
                aria-invalid={field.name === "currentPassword" && Boolean(currentPasswordError)}
                aria-describedby={field.name === "currentPassword" && currentPasswordError ? "tf-currentPassword-error" : undefined}
                onInput={() => {
                  if (field.name === "currentPassword") setCurrentPasswordError("");
                  setRequestError("");
                }}
              />
              <button
                className="tf-passwordToggle"
                type="button"
                onClick={() => setVisiblePasswords(visible => ({ ...visible, [field.name]: !visible[field.name] }))}
                aria-label={`${visiblePasswords[field.name] ? "Ocultar" : "Mostrar"} ${field.visibilityLabel}`}
                title={`${visiblePasswords[field.name] ? "Ocultar" : "Mostrar"} ${field.visibilityLabel}`}
                aria-pressed={Boolean(visiblePasswords[field.name])}
                aria-controls={`tf-${field.name}`}
              >
                {visiblePasswords[field.name] ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {field.name === "currentPassword" && currentPasswordError && (
              <p className="tf-passwordFieldError" id="tf-currentPassword-error" role="alert">{currentPasswordError}</p>
            )}
          </div>
        ))}
        <div className="tf-passwordActions">
          <button className="tf-button tf-buttonPrimary" type="submit">
            <Check size={16} aria-hidden="true" />
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
          </button>
          <button className="tf-button" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </fieldset>
      <ConfirmationDialog
        open={isConfirmationOpen}
        message="¿Está seguro de que desea cambiar su contraseña?"
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirm}
      />
    </form>
  );
}
