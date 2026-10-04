import { apiFetch } from "./client";

export interface RegisterTechnicianRequest {
  name: string;
  email: string;
  specialty: string;
}

export function registerTechnician(request: RegisterTechnicianRequest): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/technician", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
