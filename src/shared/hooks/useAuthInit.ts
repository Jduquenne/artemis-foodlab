import { useEffect } from "react";
import { registerApiErrorHandler, registerAuthExpiredHandler } from "../../core/services/apiClient";
import { silentRefresh } from "../../core/services/authService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { syncHouseholdFlagsFromApi } from "../../core/services/householdService";
import { syncJournalOverridesFromApi, syncJournalSettingsFromApi } from "../../core/services/journalService";
import { fetchCurrentPeriod } from "../../core/services/shoppingPeriodService";
import { useAuthStore, AuthStatus } from "../store/useAuthStore";
import { useJournalStore } from "../store/useJournalStore";
import { useMenuStore } from "../store/useMenuStore";
import { useNotificationStore } from "../store/useNotificationStore";

export function useAuthInit(): AuthStatus {
  const status = useAuthStore((s) => s.status);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    registerAuthExpiredHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });

    registerApiErrorHandler((error) => {
      push({
        message: error.message,
        duration: 6000,
        actions: [
          { label: "OK", onClick: () => {} },
          { label: "Fermer", onClick: () => {} },
        ],
      });
    });
  }, [setUser, setStatus, push]);

  useEffect(() => {
    silentRefresh().then((user) => {
      if (user) {
        setUser(user);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    });
  }, [setUser, setStatus]);

  useEffect(() => {
    if (status !== "authenticated") return;
    syncCatalogueFromApi();
    syncHouseholdFlagsFromApi();

    syncJournalSettingsFromApi()
      .then((settings) => useJournalStore.getState().replaceSettings(settings))
      .catch(() => { /* réseau indisponible, on garde le cache existant */ });

    syncJournalOverridesFromApi()
      .then((overrides) => useJournalStore.getState().replaceOverrides(overrides))
      .catch(() => { /* réseau indisponible, on garde le cache existant */ });

    fetchCurrentPeriod()
      .then((period) => useMenuStore.getState().replaceShoppingPeriod({ id: period?.id ?? null, days: period?.days ?? [] }))
      .catch(() => { /* réseau indisponible, on garde le cache existant */ });
  }, [status]);

  return status;
}
