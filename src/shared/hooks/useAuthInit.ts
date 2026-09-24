import { useEffect } from "react";
import { registerApiErrorHandler, registerAuthExpiredHandler } from "../../core/services/apiClient";
import { silentRefresh } from "../../core/services/authService";
import { syncBootstrapFromApi } from "../../core/services/bootstrapService";
import { syncFreezerFromApi } from "../../core/services/freezerService";
import { useAuthStore, AuthStatus } from "../store/useAuthStore";
import { useJournalStore } from "../store/useJournalStore";
import { useProfileStore } from "../store/useProfileStore";
import { useMediaStore } from "../store/useMediaStore";
import { useMenuStore } from "../store/useMenuStore";
import { useNewsStore } from "../store/useNewsStore";
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
        variant: "error",
        duration: 8000,
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
    useMediaStore.getState().resolveCatalogue();
    syncBootstrapFromApi().then((result) => {
      useNewsStore.getState().syncHasNew();
      useMediaStore.getState().resolveCatalogue();
      if (!result) return;
      useProfileStore.getState().replaceProfiles(result.profiles);
      useJournalStore.getState().replaceOverrides(result.journalOverrides);
      useMenuStore.getState().replaceShoppingPeriod({
        id: result.shoppingPeriod?.id ?? null,
        days: result.shoppingPeriod?.days ?? [],
      });
    });
    syncFreezerFromApi();
  }, [status]);

  return status;
}
