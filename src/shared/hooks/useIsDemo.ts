import { useAuthStore } from "../store/useAuthStore";

export function useIsDemo(): boolean {
  return useAuthStore((s) => s.user?.isDemo === true);
}
