export type UserRole = "admin" | "guest";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  freezerName: string;
  displayName: string | null;
}

export interface UpdateMeInput {
  freezerName?: string;
  displayName?: string | null;
  email?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  freezerName: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  displayName?: string | null;
}

export const PASSWORD_MIN_LENGTH = 12;
