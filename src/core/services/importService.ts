import { apiFetchJson } from "./apiClient";
import { SyncPayload, SyncScope } from "../logic/sync/syncPayload";

export interface ImportResult {
  summary: {
    planning?: { slots: number; items: number };
    household?: { flags: number };
    freezer?: { categories: number; items: number };
  };
  anomalies: string[];
}

export function importToApi(payload: SyncPayload, scopes: SyncScope[]): Promise<ImportResult> {
  const body: SyncPayload = {
    version: 3,
    timestamp: payload.timestamp,
    planning: scopes.includes("planning") ? payload.planning : null,
    household: scopes.includes("household") ? payload.household : null,
    freezerCategories: scopes.includes("freezer") ? payload.freezerCategories : null,
    freezerName: scopes.includes("freezer") ? payload.freezerName : null,
  };
  return apiFetchJson<ImportResult>("/import", { method: "POST", body });
}
