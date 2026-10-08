import { CopyState, MealSlot, SlotType } from "../../domain/planning";
import { MEAL_SLOTS, MealSlotDef } from "../../domain/planningConfig";
import { canAddDessert, isSlotFull } from "../../domain/recipePredicates";
import { ParsedSlot } from "./planningSlotIdLogic";
import { buildEmptySlot } from "./planningSlotEditLogic";

export interface SlotCopyProps {
  multiCopyTargetState?: "source" | "selectable" | "selected";
  dessertCopyTargetState?: "selectable" | "selected";
  copySourceDessertId?: string;
  isCopyRelevant: boolean;
}

export function copyTargetKey(day: string, slot: SlotType): string {
  return `${day}|${slot}`;
}

export function parseCopyTargetKey(key: string): { day: string; slot: SlotType } | null {
  const sep = key.indexOf("|");
  const slot = MEAL_SLOTS.find((m) => m.id === key.slice(sep + 1))?.id;
  return sep > 0 && slot ? { day: key.slice(0, sep), slot } : null;
}

export function buildCopiedSlot(
  existing: MealSlot | undefined,
  at: ParsedSlot,
  copy: Pick<CopyState, "recipeId" | "sourcePersons" | "isDessert">,
): MealSlot | null {
  const slot = existing ?? buildEmptySlot(at);
  const { recipeId, sourcePersons } = copy;
  const recipePersons = sourcePersons !== undefined ? { ...slot.recipePersons, [recipeId]: sourcePersons } : slot.recipePersons;
  if (copy.isDessert) {
    const dessertIds = slot.dessertIds ?? [];
    if (!canAddDessert(slot) || dessertIds.includes(recipeId)) return null;
    return { ...slot, dessertIds: [...dessertIds, recipeId], recipePersons };
  }
  if (isSlotFull(slot) || slot.recipeIds.includes(recipeId)) return null;
  return { ...slot, recipeIds: [...slot.recipeIds, recipeId], recipePersons };
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
        multiCopyTargetState = copyTargets.has(copyTargetKey(day, mealType.id)) ? "selected" : "selectable";
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
        dessertCopyTargetState = copyTargets.has(copyTargetKey(day, mealType.id)) ? "selected" : "selectable";
      }
    }
  }

  return { multiCopyTargetState, dessertCopyTargetState, copySourceDessertId, isCopyRelevant };
}
