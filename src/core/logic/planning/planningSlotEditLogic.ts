import { MealSlot } from "../../domain/planning";
import { MealSlotDef } from "../../domain/planningConfig";
import { isSlotFull } from "../../domain/recipePredicates";
import { ParsedSlot, buildSlotId } from "./planningSlotIdLogic";

export function buildEmptySlot(at: ParsedSlot): MealSlot {
  return { id: buildSlotId(at.year, at.week, at.day, at.slot), day: at.day, slot: at.slot, recipeIds: [], year: at.year, week: at.week };
}

function keepKeys(values: Record<string, number> | undefined, keys: Set<string>): Record<string, number> | undefined {
  if (!values) return undefined;
  const kept = Object.fromEntries(Object.entries(values).filter(([key]) => keys.has(key)));
  return Object.keys(kept).length > 0 ? kept : undefined;
}

export function replaceMainRecipe(existing: MealSlot | undefined, at: ParsedSlot, recipeId: string): MealSlot {
  const slot = existing ?? buildEmptySlot(at);
  if (slot.recipeIds.length === 1 && slot.recipeIds[0] === recipeId) return slot;
  const dessertIds = new Set(slot.dessertIds ?? []);
  return {
    ...slot,
    recipeIds: [recipeId],
    recipePersons: keepKeys(slot.recipePersons, dessertIds),
    recipeQuantities: keepKeys(slot.recipeQuantities, dessertIds),
  };
}

export function addRecipeToMultiSlot(existing: MealSlot | undefined, at: ParsedSlot, recipeId: string): MealSlot | null {
  const slot = existing ?? buildEmptySlot(at);
  if (isSlotFull(slot) || slot.recipeIds.includes(recipeId)) return null;
  return { ...slot, recipeIds: [...slot.recipeIds, recipeId] };
}

export function placeRecipeInSlot(
  existing: MealSlot | undefined,
  at: ParsedSlot,
  mealDef: MealSlotDef,
  recipeId: string,
): MealSlot | null {
  return mealDef.multi ? addRecipeToMultiSlot(existing, at, recipeId) : replaceMainRecipe(existing, at, recipeId);
}
