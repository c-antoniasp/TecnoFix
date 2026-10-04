import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../Api/auth";
import type { ChangePasswordRequest } from "../Api/auth";
import { ApiError } from "../Api/client";

interface TecnoFixChangePasswordProps {
  onCancel: () => void;
  onPasswordChanged: (message: string) => void;
  onSessionExpired: (message: string) => void;
  isSubmitting: boolean;
  onSubmittingChange: (submitting: boolean) => void;
}

type FieldErrors = Partial<Record<keyof ChangePasswordRequest, string>>;

const passwordFields = [
  { name: "currentPassword", label: "Contraseña actual", visibilityLabel: "contraseña actual", autoComplete: "current-password" },
  { name: "newPassword", label: "Nueva contraseña", visibilityLabel: "nueva contraseña", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirmar nueva contraseña", visibilityLabel: "confirmación de nueva contraseña", autoComplete: "new-password" },
] as const;

function validatePasswords(request: ChangePasswordRequest): FieldErrors {
  const errors: FieldErrors = {};
  if (!request.currentPassword.trim()) errors.currentPassword = "Debe completar el campo contraseña actual.";
  if (!request.newPassword.trim()) {
    errors.newPassword = "Debe completar el campo nueva contraseña.";
  } else if (request.newPassword.length < 8 || !/\p{L}/u.test(request.newPassword) || !/\p{Nd}/u.test(request.newPassword)) {
    errors.newPassword = "La contraseña debe tener al menos 8 caracteres, una letra y un número.";
  } else if (request.newPassword === request.currentPassword) {
    errors.newPassword = "La nueva contraseña debe ser distinta de la actual.";
  }
  if (!request.confirmPassword.trim()) {
    errors.confirmPassword = "Debe completar el campo confirmación de la nueva contraseña.";
  } else if (request.newPassword !== request.confirmPassword) {
    errors.confirmPassword = "Las contraseñas ingresadas no coinciden.";
  }
  return errors;
}

export default function TecnoFixChangePassword({ onCancel, onPasswordChanged, onSessionExpired, isSubmitting, onSubmittingChange }: TecnoFixChangePasswordProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Partial<Record<keyof ChangePasswordRequest, boolean>>>({});
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (controller.current) return;
    const form = event.currentTarget;
    // Las contraseñas viven en los campos, nunca en la sesión ni en almacenamiento.
    const data = new FormData(form);
    const request: ChangePasswordRequest = {
      currentPassword: String(data.get("currentPassword") ?? ""),
      newPassword: String(data.get("newPassword") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    };
    const errors = validatePasswords(request);
    setFieldErrors(errors);
    setRequestError("");
    const firstError = passwordFields.find(field => errors[field.name]);
    if (firstError) {
      (form.elements.namedItem(firstError.name) as HTMLInputElement).focus();
      return;
    }

    const abortController = new AbortController();
    controller.current = abortController;
    setVisiblePasswords({});
    onSubmittingChange(true);
    try {
      const response = await changePassword(request, abortController.signal);
      if (abortController.signal.aborted) return;
      form.reset();
      onPasswordChanged(response.message || "Contraseña actualizada correctamente. Debe iniciar sesión nuevamente.");
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
    <form className="tf-passwordForm" onSubmit={handleSubmit} noValidate aria-labelledby="tf-password-title" aria-busy={isSubmitting}>
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
                aria-invalid={Boolean(fieldErrors[field.name])}
                aria-describedby={fieldErrors[field.name] ? `tf-${field.name}-error` : undefined}
                onInput={() => {
                  setFieldErrors(errors => ({ ...errors, [field.name]: undefined }));
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
            {fieldErrors[field.name] && (
              <p className="tf-passwordFieldError" id={`tf-${field.name}-error`} role="alert">{fieldErrors[field.name]}</p>
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
    </form>
  );
}
