// Dirección base del backend. En desarrollo apunta a localhost;
// al desplegar, se define con la variable de entorno VITE_API_URL.
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5032/api";

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

// Tiempo máximo de espera de una respuesta del backend. Si el servidor está
// dormido o no responde, el usuario ve un mensaje en vez de una pantalla congelada.
const REQUEST_TIMEOUT_MS = 30000;

// Envoltorio de fetch: agrega la URL base, manda la cookie de sesión
// (credentials: "include") y convierte respuestas no-OK en Error con el
// mensaje que ya viene armado desde el backend (según la ERS).
export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  // Cancela la petición si pasa el tiempo máximo o si el llamador la cancela.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const callerSignal = options.signal;
  const abortWithCaller = () => controller.abort();
  callerSignal?.addEventListener("abort", abortWithCaller, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    // fetch solo falla así cuando no hay respuesta (servidor caído, sin red o CORS) o se agotó el tiempo.
    throw new ApiError(
      0,
      timedOut
        ? "El servidor tardó demasiado en responder, inténtelo nuevamente"
        : "No se pudo conectar con el servidor, inténtelo nuevamente"
    );
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", abortWithCaller);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(body as ApiErrorBody));
  }

  return body as TResponse;
}
