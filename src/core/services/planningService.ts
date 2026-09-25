import { db } from "./databaseService";
import { MealSlot } from "../domain/planning";
import { canAddDessert } from "../domain/recipePredicates";
import { apiFetch, apiFetchJson } from "./apiClient";
import {
  ApiPlanningSlot,
  ApiPlanningSlotItem,
  buildSlotItemsBatchPayload,
  diffSlotItems,
  mapApiItemsToSlotFields,
  mapApiSlotToMealSlot,
} from "../logic/planning/planningApiMapper";

export const getWeekSlots = (year: number, week: number) =>
  db.planning.where("[year+week]").equals([year, week]).toArray();

export const getAllSlots = () => db.planning.toArray();

export async function saveSlot(slot: MealSlot): Promise<void> {
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

export const addDessertToSlot = async (slot: MealSlot, recipeId: string) => {
  const ids = slot.dessertIds ?? [];
  if (!canAddDessert(slot) || ids.includes(recipeId)) return;
  await saveSlot({ ...slot, dessertIds: [...ids, recipeId] });
};

export const removeDessertFromSlot = async (slot: MealSlot, recipeId: string) => {
  await saveSlot({ ...slot, dessertIds: (slot.dessertIds ?? []).filter(id => id !== recipeId) });
};

export const setRecipePersonsOnSlot = async (slot: MealSlot, recipeId: string, persons: number) => {
  await saveSlot({ ...slot, recipePersons: { ...slot.recipePersons, [recipeId]: persons } });
};
