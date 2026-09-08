import { CreateUserInput, PASSWORD_MIN_LENGTH } from "../../services/usersService";
import { UserRole } from "../../services/authService";

export interface UserFormDraft {
  email: string;
  password: string;
  role: UserRole | "";
}

export const EMPTY_USER_FORM: UserFormDraft = { email: "", password: "", role: "guest" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserForm(draft: UserFormDraft): string[] {
  const errors: string[] = [];
  if (!EMAIL_RE.test(draft.email.trim())) errors.push("Adresse e-mail invalide.");
  if (draft.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  }
  if (draft.role !== "admin" && draft.role !== "guest") errors.push("Choisis un rôle.");
  return errors;
}

export function userFormToInput(draft: UserFormDraft): CreateUserInput {
  return { email: draft.email.trim(), password: draft.password, role: draft.role as UserRole };
}

const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePassword(length = 16): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += PASSWORD_ALPHABET[values[i] % PASSWORD_ALPHABET.length];
  }
  return result;
}
