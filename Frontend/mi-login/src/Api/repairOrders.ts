import { apiFetch } from "./client";

export interface OrderClient {
  id: string;
  name: string;
  email: string;
  rut: string | null;
}

export interface RegisterRepairOrderRequest {
  clientId: string;
  equipmentTypeId: string;
  brandModel: string;
  serialNumber?: string;
  faultDescription: string;
  accessories?: string;
}

export interface RegisterRepairOrderResponse {
  orderNumber: number;
  status: string;
  receivedAt: string;
  message: string;
}

export type RepairOrderStatus =
  | "RECEIVED"
  | "IN_DIAGNOSIS"
  | "QUOTED"
  | "IN_REPAIR"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "REJECTED";

export interface RepairOrderSummary {
  orderId: number;
  orderNumber: number;
  equipmentType: string;
  brandModel: string;
  reportedFailure: string;
  status: RepairOrderStatus;
  receivedAt: string;
}

export interface ClientRepairOrder {
  order: RepairOrderSummary;
  budget: {
    technicalDiagnosis: string | null;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  } | null;
  canDecideBudget: boolean;
  availableForPickup: boolean;
  decisionDate: string | null;
}

interface BudgetDecisionResponse {
  status: RepairOrderStatus;
  decisionDate: string;
  availableForPickup: boolean;
  message: string;
}

export function getClientOrders(signal?: AbortSignal): Promise<ClientRepairOrder[]> {
  return apiFetch<ClientRepairOrder[]>("/repair-orders/mine", { signal });
}

export function decideBudget(orderId: number, approved: boolean, signal?: AbortSignal): Promise<BudgetDecisionResponse> {
  return apiFetch<BudgetDecisionResponse>(`/repair-orders/${orderId}/budget-decision`, {
    method: "PUT",
    body: JSON.stringify({ approved }),
    signal,
  });
}

// Clientes que se pueden seleccionar al registrar una orden (ORD-001).
export function getOrderClients(): Promise<OrderClient[]> {
  return apiFetch<OrderClient[]>("/repair-orders/clients");
}

export function registerRepairOrder(request: RegisterRepairOrderRequest): Promise<RegisterRepairOrderResponse> {
  return apiFetch<RegisterRepairOrderResponse>("/repair-orders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
