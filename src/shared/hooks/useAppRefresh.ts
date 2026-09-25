import { useEffect } from "react";
import { CATALOGUE_POLL_MS } from "../../core/domain/catalogueRefreshConfig";
import { useAuthStore } from "../store/useAuthStore";
import { refreshAppData } from "../utils/appRefresh";

export function useAppRefresh(): void {
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");

  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = () => {
      void refreshAppData();
    };

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    const timer = setInterval(refresh, CATALOGUE_POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      clearInterval(timer);
    };
  }, [isAuthenticated]);
}
