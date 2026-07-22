export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL as string;

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onAuthExpired: (() => void) | null = null;
let onApiError: ((error: ApiError) => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function registerAuthExpiredHandler(handler: () => void): void {
  onAuthExpired = handler;
}

export function registerApiErrorHandler(handler: (error: ApiError) => void): void {
  onApiError = handler;
}

async function parseApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null) as { error?: { code?: ApiErrorCode; message?: string } } | null;
  const code = body?.error?.code ?? "INTERNAL_ERROR";
  const message = body?.error?.message ?? `Erreur inattendue (${res.status})`;
  return new ApiError(code, message, res.status);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json() as { accessToken: string };
        accessToken = data.accessToken;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch(path: string, init: RequestInit = {}, retried = false): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    const error = new ApiError("NETWORK_ERROR", "Connexion impossible — vérifie ta connexion réseau.", 0);
    onApiError?.(error);
    throw error;
  }

  if (res.status === 401 && !retried && !path.startsWith("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch(path, init, true);
    accessToken = null;
    onAuthExpired?.();
  }

  if (!res.ok) {
    const error = await parseApiError(res);
    onApiError?.(error);
    throw error;
  }

  return res;
}

interface ApiFetchJsonOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetchJson<T>(path: string, options: ApiFetchJsonOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | undefined;

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  } else if (body instanceof FormData) {
    finalBody = body;
  }

  const res = await apiFetch(path, { ...rest, headers: finalHeaders, body: finalBody });
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
