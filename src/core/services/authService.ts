import { apiFetch, apiFetchJson, setAccessToken } from "./apiClient";

export type UserRole = "admin" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  freezerName: string;
  displayName: string | null;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateMeInput {
  freezerName?: string;
  displayName?: string | null;
  email?: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetchJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function updateMe(
  body: UpdateMeInput,
  opts?: { suppressGlobalError?: boolean },
): Promise<AuthUser> {
  return apiFetchJson<AuthUser>("/me", { method: "PUT", body, ...opts });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<AuthUser> {
  const data = await apiFetchJson<LoginResponse>("/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
    suppressGlobalError: true,
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST", suppressGlobalError: true });
  } finally {
    setAccessToken(null);
  }
}

let silentRefreshPromise: Promise<AuthUser | null> | null = null;

export function silentRefresh(): Promise<AuthUser | null> {
  if (!silentRefreshPromise) {
    silentRefreshPromise = apiFetchJson<LoginResponse>("/auth/refresh", { method: "POST" })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.user;
      })
      .catch(() => null)
      .finally(() => {
        silentRefreshPromise = null;
      });
  }
  return silentRefreshPromise;
}
