import { useAuthStore } from "../store/useAuthStore";

export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === "admin");
}
