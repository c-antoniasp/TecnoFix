import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../Api/client";
import {
  createEquipmentType,
  getEquipmentTypes,
  toggleEquipmentTypeStatus,
  updateEquipmentType,
} from "../Api/equipmentTypes";
import type { EquipmentTypeRequest } from "../Api/equipmentTypes";
import { DashboardLayout } from "./TecnoFixDashboard";
import type { DashboardRole } from "./TecnoFixDashboard";
import { EquipmentTypeManagement } from "./EquipmentTypeManagement";
import type { EquipmentType } from "./EquipmentTypeManagement";

interface TecnoFixEquipmentTypesProps {
  userName: string;
  role: DashboardRole;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onSessionExpired: (message: string) => void;
}

// Pantalla del catálogo de tipos de equipo (ADM-001): conecta la tabla con el backend.
export default function TecnoFixEquipmentTypes({ userName, role, onNavigate, onLogout, onSessionExpired }: TecnoFixEquipmentTypesProps) {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Devuelve true si la acción tuvo éxito; si no, deja el mensaje del backend en pantalla.
  const run = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired("Su sesión expiró. Inicie sesión nuevamente.");
        return false;
      }
      setError(err instanceof Error ? err.message : "No se pudo conectar con el servidor");
      return false;
    }
  }, [onSessionExpired]);

  const load = useCallback(async () => {
    setIsLoading(true);
    await run(async () => setEquipmentTypes(await getEquipmentTypes()));
    setIsLoading(false);
  }, [run]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reemplaza en la lista el tipo de equipo que devolvió el backend.
  const replace = (updated: EquipmentType) =>
    setEquipmentTypes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

  const handleCreate = (data: EquipmentTypeRequest) =>
    run(async () => {
      const created = await createEquipmentType(data);
      setEquipmentTypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "es")));
    });

  const handleUpdate = (id: string, data: EquipmentTypeRequest) =>
    run(async () => replace(await updateEquipmentType(id, data)));

  const handleToggleStatus = (id: string) =>
    run(async () => replace(await toggleEquipmentTypeStatus(id)));

  return (
    <DashboardLayout active="Tipos de equipo" role={role} userName={userName} onNavigate={onNavigate} onLogout={onLogout}>
      <EquipmentTypeManagement
        equipmentTypes={equipmentTypes}
        isLoading={isLoading}
        error={error}
        onClearError={() => setError(null)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggleStatus={handleToggleStatus}
        onRefresh={load}
      />
    </DashboardLayout>
  );
}
