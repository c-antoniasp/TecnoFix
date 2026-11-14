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
