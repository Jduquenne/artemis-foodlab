import { db } from "./databaseService";
import { BulkPlanningResult, MealSlot, PlanningItemEntry } from "../domain/planning";
import { canAddDessert } from "../domain/recipePredicates";
import { apiFetch, apiFetchJson } from "./apiClient";
import {
  ApiBulkItemsResponse,
  ApiPlanningSlot,
  ApiPlanningSlotItem,
  buildBulkItemsPayload,
  buildSlotItemsBatchPayload,
  mapApiItemsToSlotFields,
  mapApiSlotToMealSlot,
} from "../logic/planning/planningApiMapper";
import { diffSlotItems } from "../logic/planning/slotDiffLogic";
import { ChoiceContext, pruneSlotChoices } from "../logic/accompaniment/accompanimentLogic";
import { recipesCatalogue } from "../catalogue/recipes";

export const getWeekSlots = (year: number, week: number) =>
  db.planning.where("[year+week]").equals([year, week]).toArray();

export async function saveSlot(input: MealSlot, choices: ChoiceContext): Promise<void> {
  const slot = pruneSlotChoices(input, recipesCatalogue, choices);
  const previous = await db.planning.get(slot.id);
  const diff = diffSlotItems(previous, slot);

  let apiId = previous?.apiId;

  if (diff.personsChanged || !apiId) {
    const apiSlot = await apiFetchJson<ApiPlanningSlot>(
      `/planning-slots/${slot.year}/${slot.week}/${encodeURIComponent(slot.day)}/${slot.slot}`,
      { method: "PUT", body: { persons: slot.persons ?? null } },
    );
    apiId = apiSlot.id;
  }

  const batchPayload = buildSlotItemsBatchPayload(diff);

  if (!batchPayload) {
    await db.planning.put({ ...slot, apiId, itemApiIds: diff.carryOverItemApiIds });
    return;
  }

  const { items } = await apiFetchJson<{ items: ApiPlanningSlotItem[] }>(`/planning-slots/${apiId}/items/batch`, {
    method: "PUT",
    body: batchPayload,
  });

  await db.planning.put({ ...slot, apiId, ...mapApiItemsToSlotFields(items) });
}

export async function bulkAddPlanningItems(entries: readonly PlanningItemEntry[]): Promise<BulkPlanningResult> {
  const payload = buildBulkItemsPayload(entries);
  if (!payload) return { written: 0, skipped: 0, writtenDesserts: 0, skippedDesserts: 0 };
  const { slots, skipped } = await apiFetchJson<ApiBulkItemsResponse>("/planning-slots/bulk-items", {
    method: "POST",
    body: payload,
  });
  await db.planning.bulkPut(slots.map(mapApiSlotToMealSlot));
  const sentDesserts = payload.entries.filter((entry) => entry.isDessert).length;
  const skippedDesserts = skipped.filter((entry) => entry.isDessert).length;
  const skippedDishes = skipped.length - skippedDesserts;
  return {
    written: payload.entries.length - sentDesserts - skippedDishes,
    skipped: skippedDishes,
    writtenDesserts: sentDesserts - skippedDesserts,
    skippedDesserts,
  };
}

export async function deleteSlot(id: string): Promise<void> {
  const existing = await db.planning.get(id);
  if (existing?.apiId) {
    await apiFetch(`/planning-slots/${existing.apiId}`, { method: "DELETE" });
  }
  await db.planning.delete(id);
}

export async function syncWeekFromApi(year: number, week: number): Promise<void> {
  try {
    const apiSlots = await apiFetchJson<ApiPlanningSlot[]>(`/planning-slots?year=${year}&week=${week}`);
    const mapped = apiSlots.map(mapApiSlotToMealSlot);
    await db.transaction("rw", db.planning, async () => {
      const existingIds = await db.planning.where("[year+week]").equals([year, week]).primaryKeys();
      await db.planning.bulkDelete(existingIds);
      await db.planning.bulkPut(mapped);
    });
  } catch {
    return;
  }
}

export const addDessertToSlot = async (slot: MealSlot, recipeId: string, choices: ChoiceContext) => {
  const ids = slot.dessertIds ?? [];
  if (!canAddDessert(slot) || ids.includes(recipeId)) return;
  await saveSlot({ ...slot, dessertIds: [...ids, recipeId] }, choices);
};

export const removeDessertFromSlot = async (slot: MealSlot, recipeId: string, choices: ChoiceContext) => {
  await saveSlot({ ...slot, dessertIds: (slot.dessertIds ?? []).filter(id => id !== recipeId) }, choices);
};

export const setRecipePersonsOnSlot = async (slot: MealSlot, recipeId: string, persons: number, choices: ChoiceContext) => {
  await saveSlot({ ...slot, recipePersons: { ...slot.recipePersons, [recipeId]: persons } }, choices);
};
