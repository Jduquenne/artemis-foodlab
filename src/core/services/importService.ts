import { apiFetchJson } from "./apiClient";
import { SyncPayload, SyncScope } from "../logic/sync/syncPayload";

export interface ImportSummary {
  planning?: { slots: number; items: number };
  freezer?: { categories: number; items: number };
  household?: { flags: number };
  anomalies: string[];
}

export function importToApi(payload: SyncPayload, scopes: SyncScope[]): Promise<ImportSummary> {
  const body: SyncPayload = {
    version: 3,
    timestamp: payload.timestamp,
    planning: scopes.includes("planning") ? payload.planning : null,
    household: scopes.includes("household") ? payload.household : null,
    freezerCategories: scopes.includes("freezer") ? payload.freezerCategories : null,
    freezerName: scopes.includes("freezer") ? payload.freezerName : null,
  };
  return apiFetchJson<ImportSummary>("/import", { method: "POST", body });
}
