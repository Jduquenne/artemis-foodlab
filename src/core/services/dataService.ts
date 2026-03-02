import { db } from "./db";
import { MealSlot, HouseholdRecord } from "./db";
import { FreezerCategory, ShoppingDay } from "../domain/types";

export type SyncScope = "planning" | "household" | "freezer" | "shopping";
export const ALL_SCOPES: SyncScope[] = ["planning", "household", "freezer", "shopping"];
export const SCOPE_LABELS: Record<SyncScope, { label: string; description: string }> = {
  planning: { label: "Planning", description: "Repas planifiés de la semaine" },
  household: { label: "Ménager", description: "Articles ménagers" },
  freezer: { label: "Congélateur", description: "Catégories et stocks du congélateur" },
  shopping: { label: "Courses", description: "Liste de courses et stocks" },
};

export const detectScopes = (data: SyncPayload): SyncScope[] => {
  if (data.scope) return data.scope;
  const scopes: SyncScope[] = [];
  if (data.planning != null) scopes.push("planning");
  if (data.household != null) scopes.push("household");
  if (data.freezerCategories != null || data.freezerName != null) scopes.push("freezer");
  if (data.shoppingChecked != null || data.shoppingStocks != null || data.shoppingDays != null) scopes.push("shopping");
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

export const serializeData = async (scope: SyncScope[] = ALL_SCOPES): Promise<SyncPayload> => {
  const hasPlanning = scope.includes("planning");
  const hasHousehold = scope.includes("household");
  const hasFreezer = scope.includes("freezer");
  const hasShopping = scope.includes("shopping");
  const rawChecked = hasShopping ? localStorage.getItem("cipe_shopping_checked") : null;
  const rawStocks = hasShopping ? localStorage.getItem("cipe_shopping_stocks") : null;
  const rawDays = hasShopping ? localStorage.getItem("cipe_shopping_days") : null;
  const rawFreezer = hasFreezer ? localStorage.getItem("cipe_freezer") : null;
  return {
    timestamp: new Date().toISOString(),
    version: 3,
    scope,
    planning: hasPlanning ? await db.planning.toArray() : null,
    household: hasHousehold ? await db.household.toArray() : null,
    freezerCategories: hasFreezer ? await db.freezerCategories.toArray() : null,
    freezerName: rawFreezer ? JSON.parse(rawFreezer)?.state?.freezerName ?? null : null,
    shoppingChecked: rawChecked ? JSON.parse(rawChecked) : null,
    shoppingStocks: rawStocks ? JSON.parse(rawStocks) : null,
    shoppingDays: rawDays ? JSON.parse(rawDays) : null,
  };
};

export const applyImport = async (data: SyncPayload, scope?: SyncScope[]): Promise<void> => {
  if (!data.version) throw new Error("Format de fichier invalide");
  const effectiveScope = scope ?? data.scope ?? ALL_SCOPES;
  await db.transaction("rw", db.planning, db.household, db.freezerCategories, async () => {
    if (effectiveScope.includes("planning") && data.planning) {
      await db.planning.bulkPut(data.planning);
    }
    if (effectiveScope.includes("household") && data.household?.length) {
      await db.household.bulkPut(data.household);
    }
    if (effectiveScope.includes("freezer") && data.freezerCategories?.length) {
      await db.freezerCategories.bulkPut(data.freezerCategories);
    }
  });
  if (effectiveScope.includes("freezer") && data.freezerName) {
    const current = localStorage.getItem("cipe_freezer");
    const parsed = current ? JSON.parse(current) : { state: {} };
    parsed.state.freezerName = data.freezerName;
    localStorage.setItem("cipe_freezer", JSON.stringify(parsed));
  }
  if (effectiveScope.includes("shopping")) {
    if (data.shoppingChecked) {
      localStorage.setItem("cipe_shopping_checked", JSON.stringify(data.shoppingChecked));
    }
    if (data.shoppingStocks) {
      localStorage.setItem("cipe_shopping_stocks", JSON.stringify(data.shoppingStocks));
    }
    if (data.shoppingDays) {
      localStorage.setItem("cipe_shopping_days", JSON.stringify(data.shoppingDays));
    }
  }
};

export const exportData = async (scope: SyncScope[] = ALL_SCOPES) => {
  try {
    const data = await serializeData(scope);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cipe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    alert("Erreur lors de l'export des données.");
  }
};

export const importData = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await applyImport(data);
    alert("Import réussi ! Rechargez la page.");
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    alert("Impossible de lire ce fichier de sauvegarde.");
  }
};
