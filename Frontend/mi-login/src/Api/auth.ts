import { apiFetch } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  name: string;
  email: string;
  role: "ADMIN" | "TECHNICIAN" | "CLIENT";
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  requiresLogin: boolean;
}

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

export function changePassword(request: ChangePasswordRequest, signal?: AbortSignal): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(request),
    signal,
  });
}
