import { apiFetch, apiFetchJson } from "./apiClient";
import { AdminUser, CreateUserInput, UserRole } from "../domain/user";

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
