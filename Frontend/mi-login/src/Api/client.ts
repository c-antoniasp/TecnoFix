// Dirección base del backend. En desarrollo apunta a localhost;
// al desplegar, se define con la variable de entorno VITE_API_URL.
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5032/api";

interface ApiErrorBody {
  message?: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractErrorMessage(body: ApiErrorBody | null): string {
  if (body?.message) return body.message;
  return "Ocurrió un error inesperado, inténtelo nuevamente";
}

// Envoltorio de fetch: agrega la URL base, manda la cookie de sesión
// (credentials: "include") y convierte respuestas no-OK en Error con el
// mensaje que ya viene armado desde el backend (según la ERS).
export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(body as ApiErrorBody));
  }

  return body as TResponse;
}
