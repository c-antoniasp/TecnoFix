import { apiFetch } from "./client";
import type { DiagnosisFormValues, DiagnosisOrder } from "../components/TecnoFixDiagnosis";

// ORD-002: diagnóstico y presupuesto (solo técnicos).
export function getOrdersForDiagnosis(): Promise<DiagnosisOrder[]> {
  return apiFetch<DiagnosisOrder[]>("/technician/orders/diagnosis");
}

export function startDiagnosis(orderId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/technician/orders/${orderId}/diagnosis/start`, { method: "PATCH" });
}

export function registerDiagnosis(
  orderId: number,
  values: DiagnosisFormValues
): Promise<{ message: string; totalCost: number }> {
  return apiFetch<{ message: string; totalCost: number }>(`/technician/orders/${orderId}/diagnosis`, {
    method: "POST",
    body: JSON.stringify(values),
  });
}
