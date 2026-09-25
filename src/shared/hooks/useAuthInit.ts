import { useEffect } from "react";
import { registerApiErrorHandler, registerAuthExpiredHandler } from "../../core/services/apiClient";
import { silentRefresh } from "../../core/services/authService";
import { syncBootstrapFromApi } from "../../core/services/bootstrapService";
import { syncFreezerFromApi } from "../../core/services/freezerService";
import { useAuthStore, AuthStatus } from "../store/useAuthStore";
import { useMediaStore } from "../store/useMediaStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { applyBootstrapResult } from "../utils/applyBootstrapResult";
import { markAppRefreshed } from "../utils/appRefresh";

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
      useMediaStore.getState().resolveCatalogue();
      markAppRefreshed();
      if (!result) return;
      applyBootstrapResult(result);
    });
    syncFreezerFromApi();
  }, [status]);

  return status;
}
