import { apiFetch } from "./client";
import type { EquipmentType } from "../components/EquipmentTypeManagement";

export interface EquipmentTypeRequest {
  name: string;
  description?: string;
}

// Catálogo de tipos de equipo (ADM-001). Todas las rutas exigen rol ADMIN salvo /enabled.
export function getEquipmentTypes(): Promise<EquipmentType[]> {
  return apiFetch<EquipmentType[]>("/equipment-types");
}

export function createEquipmentType(request: EquipmentTypeRequest): Promise<EquipmentType> {
  return apiFetch<EquipmentType>("/equipment-types", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateEquipmentType(id: string, request: EquipmentTypeRequest): Promise<EquipmentType> {
  return apiFetch<EquipmentType>(`/equipment-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function toggleEquipmentTypeStatus(id: string): Promise<EquipmentType> {
  return apiFetch<EquipmentType>(`/equipment-types/${id}/status`, { method: "PATCH" });
}
