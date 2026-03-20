import { db } from "./databaseService";
import { MealSlot } from "../domain/types";
import { canAddDessert } from "../domain/recipePredicates";

export const getWeekSlots = (year: number, week: number) =>
  db.planning.where("[year+week]").equals([year, week]).toArray();

export const getAllSlots = () => db.planning.toArray();

export const saveSlot = (slot: MealSlot) => db.planning.put(slot);

export const bulkSaveSlots = (slots: MealSlot[]) => db.planning.bulkPut(slots);

export const deleteSlot = (id: string) => db.planning.delete(id);

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
