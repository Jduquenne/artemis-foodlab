import { MealSlot } from "../../domain/planning";
import { MAX_DESSERTS_PER_SLOT } from "../../domain/planningConfig";
import { ParsedSlot } from "./planningSlotIdLogic";
import { pickFoodChoices } from "../foodGroup/foodChoiceLogic";

export interface DragMoveResult {
  toSave: MealSlot[];
  toDelete?: string;
}

function placeMeal(
  base: MealSlot | undefined,
  id: string,
  at: ParsedSlot,
  recipeIds: string[],
  dessertIds: string[] | undefined,
  choiceSources: readonly MealSlot[],
): MealSlot {
  return {
    ...base,
    id,
    day: at.day,
    slot: at.slot,
    year: at.year,
    week: at.week,
    recipeIds,
    dessertIds,
    persons: undefined,
    recipePersons: undefined,
    recipeQuantities: undefined,
    foodChoices: pickFoodChoices(choiceSources.map((source) => source.foodChoices), [...recipeIds, ...(dessertIds ?? [])]),
  };
}

export function incomingDessertChoice(fromMeal: MealSlot, toMeal: MealSlot | undefined): string[] | null {
  if (!toMeal || toMeal.recipeIds.length > 0) return null;
  const merged = [...new Set([...(toMeal.dessertIds ?? []), ...(fromMeal.dessertIds ?? [])])];
  return merged.length > MAX_DESSERTS_PER_SLOT ? merged : null;
}

export function computeDragMoveSlots(
  fromMeal: MealSlot,
  toMeal: MealSlot | undefined,
  fromId: string,
  toId: string,
  from: ParsedSlot,
  to: ParsedSlot,
  moveDesserts: boolean,
  keptDessertIds?: string[],
): DragMoveResult {
  const toHasRecipe = (toMeal?.recipeIds.length ?? 0) > 0;

  if (toMeal && toHasRecipe) {
    return {
      toSave: [
        placeMeal(fromMeal, fromId, from, toMeal.recipeIds, moveDesserts ? toMeal.dessertIds : fromMeal.dessertIds, [toMeal, fromMeal]),
        placeMeal(toMeal, toId, to, fromMeal.recipeIds, moveDesserts ? fromMeal.dessertIds : toMeal.dessertIds, [fromMeal, toMeal]),
      ],
    };
  }

  const destinationDessertIds = toMeal?.dessertIds ?? [];
  const incomingDessertIds = moveDesserts ? (fromMeal.dessertIds ?? []) : [];
  const mergedDessertIds = (keptDessertIds ?? [...new Set([...destinationDessertIds, ...incomingDessertIds])]).slice(0, MAX_DESSERTS_PER_SLOT);
  const destinationSlot = placeMeal(
    toMeal,
    toId,
    to,
    fromMeal.recipeIds,
    mergedDessertIds.length > 0 ? mergedDessertIds : undefined,
    toMeal ? [fromMeal, toMeal] : [fromMeal],
  );

  if (moveDesserts) {
    return { toSave: [destinationSlot], toDelete: fromMeal.id };
  }

  return {
    toSave: [{ ...fromMeal, recipeIds: [] }, destinationSlot],
  };
}
