import { MealSlot, SlotType } from "../../domain/types";
import { canAddDessert, isSlotFull } from "../../domain/recipePredicates";
import { CopyState, MEAL_SLOTS, MealSlotDef } from "../../domain/planningConfig";

export function parseFullSlotId(fullId: string): ParsedSlot | null {
  const wIdx = fullId.indexOf('-W');
  if (wIdx === -1) return null;
  const yearStr = fullId.slice(0, wIdx);
  const rest = fullId.slice(wIdx + 2);
  const dashIdx = rest.indexOf('-');
  if (dashIdx === -1) return null;
  const weekStr = rest.slice(0, dashIdx);
  const daySlot = rest.slice(dashIdx + 1);
  for (const m of MEAL_SLOTS) {
    if (daySlot.endsWith(`-${m.id}`)) {
      return {
        year: parseInt(yearStr, 10),
        week: parseInt(weekStr, 10),
        day: daySlot.slice(0, daySlot.length - m.id.length - 1),
        slot: m.id,
      };
    }
  }
  return null;
}

export interface ParsedSlot {
  year: number;
  week: number;
  day: string;
  slot: SlotType;
}

export interface DragMoveResult {
  toSave: MealSlot[];
  toDelete?: string;
}

export function computeDragMoveSlots(
  fromMeal: MealSlot,
  toMeal: MealSlot | undefined,
  fromId: string,
  toId: string,
  from: ParsedSlot,
  to: ParsedSlot,
  moveDesserts: boolean,
): DragMoveResult {
  if (toMeal) {
    return {
      toSave: [
        {
          ...fromMeal, id: fromId, day: from.day, slot: from.slot, year: from.year, week: from.week,
          recipeIds: toMeal.recipeIds,
          dessertIds: moveDesserts ? toMeal.dessertIds : fromMeal.dessertIds,
          persons: undefined, recipePersons: undefined, recipeQuantities: undefined,
        },
        {
          ...toMeal, id: toId, day: to.day, slot: to.slot, year: to.year, week: to.week,
          recipeIds: fromMeal.recipeIds,
          dessertIds: moveDesserts ? fromMeal.dessertIds : toMeal.dessertIds,
          persons: undefined, recipePersons: undefined, recipeQuantities: undefined,
        },
      ],
    };
  }

  if (moveDesserts) {
    return {
      toSave: [{ id: toId, day: to.day, slot: to.slot, recipeIds: fromMeal.recipeIds, dessertIds: fromMeal.dessertIds, year: to.year, week: to.week }],
      toDelete: fromMeal.id,
    };
  }

  return {
    toSave: [
      { ...fromMeal, recipeIds: [] },
      { id: toId, day: to.day, slot: to.slot, recipeIds: fromMeal.recipeIds, year: to.year, week: to.week },
    ],
  };
}

export interface SlotCopyProps {
  multiCopyTargetState?: "source" | "selectable" | "selected";
  dessertCopyTargetState?: "selectable" | "selected";
  copySourceDessertId?: string;
  isCopyRelevant: boolean;
}

export function computeSlotCopyProps(
  copyState: CopyState | null,
  copyTargets: Set<string>,
  day: string,
  mealType: MealSlotDef,
  savedMeal: MealSlot | undefined,
): SlotCopyProps {
  if (!copyState) {
    return { isCopyRelevant: true };
  }

  const isSource = day === copyState.sourceDay && mealType.id === copyState.slotType;
  const isCopyRelevant = copyState.isDessert ? mealType.hasDessert : mealType.id === copyState.slotType;

  let multiCopyTargetState: SlotCopyProps["multiCopyTargetState"];
  if (!copyState.isDessert && mealType.id === copyState.slotType) {
    if (isSource) {
      multiCopyTargetState = "source";
    } else {
      const recipeIds = savedMeal?.recipeIds ?? [];
      const alreadyHas = recipeIds.includes(copyState.recipeId);
      if (!alreadyHas && !isSlotFull({ recipeIds })) {
        multiCopyTargetState = copyTargets.has(`${day}|${mealType.id}`) ? "selected" : "selectable";
      }
    }
  }

  let dessertCopyTargetState: SlotCopyProps["dessertCopyTargetState"];
  let copySourceDessertId: string | undefined;
  if (copyState.isDessert && mealType.hasDessert) {
    if (isSource) {
      copySourceDessertId = copyState.recipeId;
    } else {
      const alreadyHas = savedMeal?.dessertIds?.includes(copyState.recipeId) ?? false;
      if (!alreadyHas && canAddDessert({ dessertIds: savedMeal?.dessertIds })) {
        dessertCopyTargetState = copyTargets.has(`${day}|${mealType.id}`) ? "selected" : "selectable";
      }
    }
  }

  return { multiCopyTargetState, dessertCopyTargetState, copySourceDessertId, isCopyRelevant };
}
