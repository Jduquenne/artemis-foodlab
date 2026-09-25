import { useEffect } from "react";
import { CATALOGUE_POLL_MS, CATALOGUE_REFRESH_MIN_MS } from "../../core/domain/catalogueRefreshConfig";
import { shouldRefreshCatalogue } from "../../core/logic/sync/catalogueRefreshLogic";
import { getLastCatalogueSyncAt, syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { useAuthStore } from "../store/useAuthStore";

export function useCatalogueRefresh(): void {
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");

  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (!shouldRefreshCatalogue(Date.now(), getLastCatalogueSyncAt(), CATALOGUE_REFRESH_MIN_MS)) return;
      void syncCatalogueFromApi({ silent: true });
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
