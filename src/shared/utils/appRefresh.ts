import { CATALOGUE_REFRESH_MIN_MS } from "../../core/domain/catalogueRefreshConfig";
import { shouldRefreshCatalogue } from "../../core/logic/sync/catalogueRefreshLogic";
import { syncBootstrapFromApi } from "../../core/services/bootstrapService";
import { syncFreezerFromApi } from "../../core/services/freezerService";
import { usePendingStore } from "../store/usePendingStore";
import { useRefreshStore } from "../store/useRefreshStore";
import { applyBootstrapResult } from "./applyBootstrapResult";

let lastAttemptAt = 0;
let refreshing = false;

export function markAppRefreshed(): void {
  lastAttemptAt = Date.now();
}

export async function refreshAppData(): Promise<void> {
  if (refreshing) return;
  if (document.visibilityState !== "visible") return;
  if (usePendingStore.getState().keys.size > 0) return;
  if (!shouldRefreshCatalogue(Date.now(), lastAttemptAt, CATALOGUE_REFRESH_MIN_MS)) return;

  refreshing = true;
  lastAttemptAt = Date.now();
  try {
    const [result] = await Promise.all([syncBootstrapFromApi({ silent: true }), syncFreezerFromApi({ silent: true })]);
    if (result) applyBootstrapResult(result);
    useRefreshStore.getState().bump();
  } finally {
    refreshing = false;
  }
}
