import { apiFetch, apiFetchJson } from "./apiClient";
import { UserRole } from "./authService";

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  freezerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export const PASSWORD_MIN_LENGTH = 12;

export function listUsers(): Promise<AdminUser[]> {
  return apiFetchJson<AdminUser[]>("/users");
}

export function createUser(input: CreateUserInput): Promise<AdminUser> {
  return apiFetchJson<AdminUser>("/users", { method: "POST", body: input });
}

export function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return apiFetchJson<AdminUser>(`/users/${id}`, { method: "PUT", body: { role } });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}
