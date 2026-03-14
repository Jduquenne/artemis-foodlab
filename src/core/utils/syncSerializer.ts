import { db } from "../services/databaseService";
import {
  FreezerCategory,
  MealSlot,
  HouseholdRecord,
  ShoppingDay,
} from "../domain/types";

export type SyncScope = "planning" | "household" | "freezer" | "shopping";
export const ALL_SCOPES: SyncScope[] = [
  "planning",
  "household",
  "freezer",
  "shopping",
];
export const SCOPE_LABELS: Record<
  SyncScope,
  { label: string; description: string }
> = {
  planning: { label: "Planning", description: "Repas planifiés de la semaine" },
  household: { label: "Ménager", description: "Articles ménagers" },
  freezer: {
    label: "Congélateur",
    description: "Catégories et stocks du congélateur",
  },
  shopping: { label: "Courses", description: "Liste de courses et stocks" },
};

export const detectScopes = (data: SyncPayload): SyncScope[] => {
  const scopes: SyncScope[] = [];

  if (data.scope) return data.scope;
  if (data.planning != null) scopes.push("planning");
  if (data.household != null) scopes.push("household");
  if (data.freezerCategories != null || data.freezerName != null)
    scopes.push("freezer");
  if (
    data.shoppingChecked != null ||
    data.shoppingStocks != null ||
    data.shoppingDays != null
  )
    scopes.push("shopping");
  return scopes.length > 0 ? scopes : [...ALL_SCOPES];
};

export interface SyncPayload {
  timestamp: string;
  version: 3;
  scope?: SyncScope[];
  planning: MealSlot[] | null;
  household: HouseholdRecord[] | null;
  freezerCategories: FreezerCategory[] | null;
  freezerName: string | null;
  shoppingChecked: Record<string, boolean> | null;
  shoppingStocks: Record<string, number> | null;
  shoppingDays: ShoppingDay[] | null;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function isValidSyncPayload(data: unknown): data is SyncPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.version !== 3) return false;
  if (d.planning !== null && !Array.isArray(d.planning)) return false;
  if (d.household !== null && !Array.isArray(d.household)) return false;
  if (d.freezerCategories !== null && !Array.isArray(d.freezerCategories))
    return false;
  if (d.freezerName !== null && typeof d.freezerName !== "string") return false;
  return true;
}

export const serializeData = async (
  scope: SyncScope[] = ALL_SCOPES,
): Promise<SyncPayload> => {
  const hasPlanning = scope.includes("planning");
  const hasHousehold = scope.includes("household");
  const hasFreezer = scope.includes("freezer");
  const hasShopping = scope.includes("shopping");
  const rawChecked = hasShopping
    ? localStorage.getItem("cipe_shopping_checked")
    : null;
  const rawStocks = hasShopping
    ? localStorage.getItem("cipe_shopping_stocks")
    : null;
  const rawDays = hasShopping
    ? localStorage.getItem("cipe_shopping_days")
    : null;
  const rawFreezer = hasFreezer ? localStorage.getItem("cipe_freezer") : null;
  return {
    timestamp: new Date().toISOString(),
    version: 3,
    scope,
    planning: hasPlanning ? await db.planning.toArray() : null,
    household: hasHousehold ? await db.household.toArray() : null,
    freezerCategories: hasFreezer ? await db.freezerCategories.toArray() : null,
    freezerName:
      safeParseJson<{ state?: { freezerName?: string } }>(rawFreezer)?.state
        ?.freezerName ?? null,
    shoppingChecked: safeParseJson<Record<string, boolean>>(rawChecked),
    shoppingStocks: safeParseJson<Record<string, number>>(rawStocks),
    shoppingDays: safeParseJson<ShoppingDay[]>(rawDays),
  };
};

export const applyImport = async (
  data: unknown,
  scope?: SyncScope[],
): Promise<void> => {
  if (!isValidSyncPayload(data))
    throw new Error("Format de fichier invalide ou version incompatible");
  const effectiveScope = scope ?? data.scope ?? ALL_SCOPES;
  await db.transaction(
    "rw",
    db.planning,
    db.household,
    db.freezerCategories,
    async () => {
      if (effectiveScope.includes("planning") && data.planning) {
        await db.planning.bulkPut(data.planning);
      }
      if (effectiveScope.includes("household") && data.household?.length) {
        await db.household.bulkPut(data.household);
      }
      if (
        effectiveScope.includes("freezer") &&
        data.freezerCategories?.length
      ) {
        await db.freezerCategories.bulkPut(data.freezerCategories);
      }
    },
  );
  if (effectiveScope.includes("freezer") && data.freezerName) {
    const current = localStorage.getItem("cipe_freezer");
    const parsed = safeParseJson<{ state?: Record<string, unknown> }>(
      current,
    ) ?? { state: {} };
    if (!parsed.state) parsed.state = {};
    parsed.state.freezerName = data.freezerName;
    localStorage.setItem("cipe_freezer", JSON.stringify(parsed));
  }
  if (effectiveScope.includes("shopping")) {
    if (data.shoppingChecked) {
      localStorage.setItem(
        "cipe_shopping_checked",
        JSON.stringify(data.shoppingChecked),
      );
    }
    if (data.shoppingStocks) {
      localStorage.setItem(
        "cipe_shopping_stocks",
        JSON.stringify(data.shoppingStocks),
      );
    }
    if (data.shoppingDays) {
      localStorage.setItem(
        "cipe_shopping_days",
        JSON.stringify(data.shoppingDays),
      );
    }
  }
};
