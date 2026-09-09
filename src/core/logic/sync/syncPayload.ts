import { FreezerCategory, HouseholdRecord, MealSlot } from "../../domain/types";

export type SyncScope = "planning" | "household" | "freezer";

export const ALL_SCOPES: SyncScope[] = ["planning", "household", "freezer"];

export const SCOPE_LABELS: Record<SyncScope, { label: string; description: string }> = {
  planning: { label: "Planning", description: "Repas planifiés de la semaine" },
  household: { label: "Ménager", description: "Articles ménagers à acheter" },
  freezer: { label: "Congélateur", description: "Catégories et stocks du congélateur" },
};

export interface SyncPayload {
  timestamp: string;
  version: 3;
  scope?: SyncScope[];
  planning: MealSlot[] | null;
  household: HouseholdRecord[] | null;
  freezerCategories: FreezerCategory[] | null;
  freezerName: string | null;
}

export function isValidSyncPayload(data: unknown): data is SyncPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.version !== 3) return false;
  if (d.planning !== null && d.planning !== undefined && !Array.isArray(d.planning)) return false;
  if (d.household !== null && d.household !== undefined && !Array.isArray(d.household)) return false;
  if (d.freezerCategories !== null && d.freezerCategories !== undefined && !Array.isArray(d.freezerCategories)) return false;
  if (d.freezerName != null && typeof d.freezerName !== "string") return false;
  return true;
}

export function detectScopes(data: SyncPayload): SyncScope[] {
  if (data.scope) {
    const known = data.scope.filter((s): s is SyncScope => ALL_SCOPES.includes(s as SyncScope));
    if (known.length > 0) return known;
  }
  const scopes: SyncScope[] = [];
  if (data.planning != null) scopes.push("planning");
  if (data.household != null) scopes.push("household");
  if (data.freezerCategories != null || data.freezerName != null) scopes.push("freezer");
  return scopes.length > 0 ? scopes : [...ALL_SCOPES];
}
