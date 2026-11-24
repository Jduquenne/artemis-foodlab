import { apiFetchJson, performTokenRefresh, setAccessToken } from "./apiClient";
import { AuthUser } from "../domain/user";
import { getStoredRefreshToken, setStoredRefreshToken } from "./refreshTokenStore";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

function adoptSession(data: LoginResponse): AuthUser {
  setAccessToken(data.accessToken);
  setStoredRefreshToken(data.refreshToken ?? null);
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetchJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return adoptSession(data);
}

export async function startDemo(): Promise<AuthUser> {
  const data = await apiFetchJson<LoginResponse>("/auth/demo", { method: "POST" });
  return adoptSession(data);
}

export interface ApiUpdateMeBody {
  freezerName?: string;
  shoppingPlaceName?: string | null;
  displayName?: string | null;
  email?: string;
  shoppingCategoryOrder?: string[] | null;
  priceStoreId?: string | null;
}

export async function updateMe(
  body: ApiUpdateMeBody,
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
  return adoptSession(data);
}

export async function logout(): Promise<void> {
  const stored = getStoredRefreshToken();
  try {
    await apiFetchJson<void>("/auth/logout", {
      method: "POST",
      body: stored ? { refreshToken: stored } : undefined,
      suppressGlobalError: true,
    });
  } finally {
    setAccessToken(null);
    setStoredRefreshToken(null);
  }
}

export function silentRefresh(): Promise<AuthUser | null> {
  return performTokenRefresh().then((data) => (data ? (data.user as AuthUser) : null));
}
