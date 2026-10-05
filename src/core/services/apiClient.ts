export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "DEMO_FORBIDDEN"
  | "DEMO_RATE_LIMIT"
  | "DEMO_CAPACITY"
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

import { REFRESH_RETRY_DELAYS_MS, isRefreshRejected } from "../logic/auth/refreshOutcomeLogic";
import { getStoredRefreshToken, setStoredRefreshToken } from "./refreshTokenStore";

const API_URL = import.meta.env.VITE_API_URL as string;

const FALLBACK_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "Données invalides — vérifie le formulaire.",
  UNAUTHENTICATED: "Session expirée — reconnecte-toi.",
  FORBIDDEN: "Action non autorisée.",
  NOT_FOUND: "Ressource introuvable.",
  CONFLICT: "Cette action entre en conflit avec des données existantes.",
  PAYLOAD_TOO_LARGE: "Fichier trop volumineux.",
  RATE_LIMITED: "Trop de requêtes — réessaie dans un instant.",
  DEMO_FORBIDDEN: "Cette action n'est pas disponible en mode démo.",
  DEMO_RATE_LIMIT: "Trop de démos lancées depuis cette connexion — réessaie dans une heure.",
  DEMO_CAPACITY: "La démo est momentanément complète — réessaie plus tard.",
  INTERNAL_ERROR: "Erreur serveur — réessaie plus tard.",
  NETWORK_ERROR: "Connexion impossible — vérifie ta connexion réseau.",
};

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

let accessToken: string | null = null;
let refreshPromise: Promise<TokenRefreshResult | null> | null = null;
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
  const message = body?.error?.message ?? FALLBACK_MESSAGES[code] ?? FALLBACK_MESSAGES.INTERNAL_ERROR;
  return new ApiError(code, message, res.status);
}

export function performTokenRefresh(): Promise<TokenRefreshResult | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt++) {
        const stored = getStoredRefreshToken();
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: stored ? { "Content-Type": "application/json" } : undefined,
          body: stored ? JSON.stringify({ refreshToken: stored }) : undefined,
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json() as TokenRefreshResult;
          accessToken = data.accessToken;
          setStoredRefreshToken(data.refreshToken ?? null);
          return data;
        }

        if (isRefreshRejected(res?.status ?? null)) {
          accessToken = null;
          setStoredRefreshToken(null);
          return null;
        }

        if (attempt < REFRESH_RETRY_DELAYS_MS.length) {
          await new Promise((resolve) => setTimeout(resolve, REFRESH_RETRY_DELAYS_MS[attempt]));
        }
      }

      return null;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export interface ApiFetchInit extends RequestInit {
  suppressGlobalError?: boolean;
}

export async function apiFetch(path: string, init: ApiFetchInit = {}, retried = false): Promise<Response> {
  const { suppressGlobalError, ...fetchInit } = init;
  const notify = (error: ApiError) => {
    if (!suppressGlobalError) onApiError?.(error);
  };
  const headers = new Headers(fetchInit.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...fetchInit,
      headers,
      credentials: "include",
    });
  } catch {
    const error = new ApiError("NETWORK_ERROR", FALLBACK_MESSAGES.NETWORK_ERROR, 0);
    notify(error);
    throw error;
  }

  if (res.status === 401 && !retried && !path.startsWith("/auth/")) {
    const refreshed = await performTokenRefresh();
    if (refreshed) return apiFetch(path, init, true);
    onAuthExpired?.();
  }

  if (!res.ok) {
    const error = await parseApiError(res);
    notify(error);
    throw error;
  }

  return res;
}

interface ApiFetchJsonOptions extends Omit<ApiFetchInit, "body"> {
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
