import { db } from "./db";
import { MealSlot, HouseholdRecord } from "./db";
import { FreezerCategory, ShoppingDay } from "../domain/types";

export interface SyncPayload {
  timestamp: string;
  version: 3;
  planning: MealSlot[];
  household: HouseholdRecord[];
  freezerCategories: FreezerCategory[];
  freezerName: string | null;
  shoppingChecked: Record<string, boolean> | null;
  shoppingStocks: Record<string, number> | null;
  shoppingDays: ShoppingDay[] | null;
}

export const serializeData = async (): Promise<SyncPayload> => {
  const planning = await db.planning.toArray();
  const household = await db.household.toArray();
  const freezerCategories = await db.freezerCategories.toArray();
  const rawChecked = localStorage.getItem("cipe_shopping_checked");
  const rawStocks = localStorage.getItem("cipe_shopping_stocks");
  const rawDays = localStorage.getItem("cipe_shopping_days");
  const rawFreezer = localStorage.getItem("cipe_freezer");
  return {
    timestamp: new Date().toISOString(),
    version: 3,
    planning,
    household,
    freezerCategories,
    freezerName: rawFreezer ? JSON.parse(rawFreezer)?.state?.freezerName ?? null : null,
    shoppingChecked: rawChecked ? JSON.parse(rawChecked) : null,
    shoppingStocks: rawStocks ? JSON.parse(rawStocks) : null,
    shoppingDays: rawDays ? JSON.parse(rawDays) : null,
  };
};

export const applyImport = async (data: SyncPayload): Promise<void> => {
  if (!data.planning) throw new Error("Format de fichier invalide");
  await db.transaction("rw", db.planning, db.household, db.freezerCategories, async () => {
    await db.planning.bulkPut(data.planning);
    if (data.household?.length) {
      await db.household.bulkPut(data.household);
    }
    if (data.freezerCategories?.length) {
      await db.freezerCategories.bulkPut(data.freezerCategories);
    }
  });
  if (data.freezerName) {
    const current = localStorage.getItem("cipe_freezer");
    const parsed = current ? JSON.parse(current) : { state: {} };
    parsed.state.freezerName = data.freezerName;
    localStorage.setItem("cipe_freezer", JSON.stringify(parsed));
  }
  if (data.shoppingChecked) {
    localStorage.setItem("cipe_shopping_checked", JSON.stringify(data.shoppingChecked));
  }
  if (data.shoppingStocks) {
    localStorage.setItem("cipe_shopping_stocks", JSON.stringify(data.shoppingStocks));
  }
  if (data.shoppingDays) {
    localStorage.setItem("cipe_shopping_days", JSON.stringify(data.shoppingDays));
  }
};

export const exportData = async () => {
  try {
    const data = await serializeData();
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
