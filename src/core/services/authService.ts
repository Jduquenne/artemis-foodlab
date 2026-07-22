import { apiFetch, apiFetchJson, setAccessToken } from "./apiClient";

export type UserRole = "admin" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  freezerName: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetchJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function updateMe(freezerName: string): Promise<AuthUser> {
  return apiFetchJson<AuthUser>("/me", { method: "PUT", body: { freezerName } });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
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
