import { create } from "zustand";
import { AuthUser } from "../../core/services/authService";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "checking",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
}));
