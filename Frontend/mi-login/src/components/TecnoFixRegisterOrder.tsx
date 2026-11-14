import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CircleHelp } from "lucide-react";
import { ApiError } from "../Api/client";
import { getEnabledEquipmentTypes } from "../Api/equipmentTypes";
import { getOrderClients, registerRepairOrder } from "../Api/repairOrders";
import type { OrderClient } from "../Api/repairOrders";
import ConfirmDialog from "./ConfirmDialog";
import type { EquipmentType } from "./EquipmentTypeManagement";
import { DashboardLayout } from "./TecnoFixDashboard";
import type { DashboardRole } from "./TecnoFixDashboard";
import { requiredFieldMessage } from "../utils/validation";
import "./TecnoFixRegisterOrder.css";

interface TecnoFixRegisterOrderProps {
  userName: string;
  role: DashboardRole;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onSessionExpired: (message: string) => void;
}

interface OrderForm {
  clientId: string;
  equipmentTypeId: string;
  brandModel: string;
  serialNumber: string;
  faultDescription: string;
  accessories: string;
}

type FieldName = keyof OrderForm;

const EMPTY_FORM: OrderForm = {
  clientId: "",
  equipmentTypeId: "",
  brandModel: "",
  serialNumber: "",
  faultDescription: "",
  accessories: "",
};

// Campos obligatorios en el orden del formulario, con el nombre que muestra la ERS.
const REQUIRED_FIELDS: [FieldName, string][] = [
  ["clientId", "Cliente"],
  ["equipmentTypeId", "Tipo de equipo"],
  ["brandModel", "Marca y modelo"],
  ["faultDescription", "Descripción de la falla"],
];

// Ayuda en línea de cada campo (REQ NF03).
const HELP: Record<FieldName, string> = {
  clientId: "Cliente dueño del equipo. Si no aparece, primero debe registrarse en el sistema.",
  equipmentTypeId: "Solo se muestran los tipos de equipo habilitados en el catálogo.",
  brandModel: "Marca y modelo tal como aparecen en el equipo, por ejemplo: Lenovo ThinkPad T14.",
  serialNumber: "Opcional. Número de serie impreso en la etiqueta del equipo.",
  faultDescription: "Describa la falla tal como la informa el cliente.",
  accessories: "Opcional. Por ejemplo: cargador, funda, cable USB.",
};

// ORD-001: registro de una orden de reparación al recibir un equipo.
export default function TecnoFixRegisterOrder({ userName, role, onNavigate, onLogout, onSessionExpired }: TecnoFixRegisterOrderProps) {
  const [clients, setClients] = useState<OrderClient[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [invalidField, setInvalidField] = useState<FieldName | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      onSessionExpired("Su sesión expiró. Inicie sesión nuevamente.");
      return;
    }
    setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor");
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([getOrderClients(), getEnabledEquipmentTypes()])
      .then(([clientList, typeList]) => {
        if (ignore) return;
        setClients(clientList);
        setEquipmentTypes(typeList);
      })
      .catch((err) => {
        if (!ignore) handleRequestError(err);
      })
      .finally(() => {
        if (!ignore) setIsLoadingOptions(false);
      });
    return () => {
      ignore = true;
    };
    // Las opciones se cargan una sola vez al abrir la pantalla.
  }, []);

  const updateField = (field: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (invalidField === field) setInvalidField(null);
    setSuccessMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const missing = REQUIRED_FIELDS.find(([field]) => !form[field].trim());
    if (missing) {
      setInvalidField(missing[0]);
      setError(requiredFieldMessage(missing[1]));
      return;
    }
    setInvalidField(null);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const result = await registerRepairOrder({
        clientId: form.clientId,
        equipmentTypeId: form.equipmentTypeId,
        brandModel: form.brandModel.trim(),
        serialNumber: form.serialNumber.trim() || undefined,
        faultDescription: form.faultDescription.trim(),
        accessories: form.accessories.trim() || undefined,
      });
      setSuccessMessage(result.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      handleRequestError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients.find((client) => client.id === form.clientId);

  const label = (field: FieldName, text: string, optional = false) => (
    <div className="tf-orderLabel">
      <label htmlFor={`order-${field}`}>
        {text}
        {optional && <span className="tf-orderOptional"> (opcional)</span>}
      </label>
      <span className="tf-orderHelp" tabIndex={0} aria-label={HELP[field]} data-tooltip={HELP[field]}>
        <CircleHelp size={15} aria-hidden="true" />
      </span>
    </div>
  );

  return (
    <DashboardLayout
      active="Órdenes"
      role={role}
      userName={userName}
      onNavigate={onNavigate}
      onLogout={onLogout}
      navigationDisabled={isSubmitting}
    >
      <ConfirmDialog
        open={showConfirm}
        message={
          <>
            ¿Está seguro de registrar la orden de reparación de <strong>{selectedClient?.name}</strong>?
          </>
        }
        confirmLabel="Sí, registrar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />

      <section className="tf-order" aria-labelledby="tf-order-title">
        <header className="tf-orderHeader">
          <h1 id="tf-order-title">Registrar orden de reparación</h1>
          <p>Ingrese los datos del equipo recibido. La orden queda en estado «Recibida».</p>
        </header>

        <form className="tf-orderForm" onSubmit={handleSubmit} noValidate>
          {error && <p className="tf-orderError" role="alert">{error}</p>}
          {successMessage && <p className="tf-orderSuccess" role="status">{successMessage}</p>}

          <fieldset disabled={isSubmitting || isLoadingOptions}>
            <div className="tf-orderField">
              {label("clientId", "Cliente")}
              <select
                id="order-clientId"
                className="tf-input"
                value={form.clientId}
                onChange={(e) => updateField("clientId", e.target.value)}
                aria-invalid={invalidField === "clientId"}
              >
                <option value="">{isLoadingOptions ? "Cargando clientes..." : "Seleccione un cliente"}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.rut ? ` — ${client.rut}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="tf-orderField">
              {label("equipmentTypeId", "Tipo de equipo")}
              <select
                id="order-equipmentTypeId"
                className="tf-input"
                value={form.equipmentTypeId}
                onChange={(e) => updateField("equipmentTypeId", e.target.value)}
                aria-invalid={invalidField === "equipmentTypeId"}
              >
                <option value="">{isLoadingOptions ? "Cargando tipos de equipo..." : "Seleccione un tipo de equipo"}</option>
                {equipmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="tf-orderField">
              {label("brandModel", "Marca y modelo")}
              <input
                id="order-brandModel"
                className="tf-input"
                type="text"
                value={form.brandModel}
                onChange={(e) => updateField("brandModel", e.target.value)}
                aria-invalid={invalidField === "brandModel"}
              />
            </div>

            <div className="tf-orderField">
              {label("serialNumber", "Número de serie", true)}
              <input
                id="order-serialNumber"
                className="tf-input"
                type="text"
                value={form.serialNumber}
                onChange={(e) => updateField("serialNumber", e.target.value)}
              />
            </div>

            <div className="tf-orderField tf-orderFieldWide">
              {label("faultDescription", "Descripción de la falla")}
              <textarea
                id="order-faultDescription"
                className="tf-input"
                rows={4}
                value={form.faultDescription}
                onChange={(e) => updateField("faultDescription", e.target.value)}
                aria-invalid={invalidField === "faultDescription"}
              />
            </div>

            <div className="tf-orderField tf-orderFieldWide">
              {label("accessories", "Accesorios entregados", true)}
              <textarea
                id="order-accessories"
                className="tf-input"
                rows={2}
                value={form.accessories}
                onChange={(e) => updateField("accessories", e.target.value)}
              />
            </div>
          </fieldset>

          <div className="tf-orderActions">
            <button
              className="tf-button"
              type="button"
              onClick={() => onNavigate("Resumen")}
              disabled={isSubmitting}
            >
              Volver
            </button>
            <button className="tf-button tf-buttonPrimary" type="submit" disabled={isSubmitting || isLoadingOptions}>
              {isSubmitting ? "Registrando orden..." : "Registrar orden"}
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  );
}
