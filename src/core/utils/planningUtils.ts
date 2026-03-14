import { MealSlot } from "../domain/types";
import { canAddDessert, isSlotFull } from "../domain/recipePredicates";
import { CopyState, MealSlotDef } from "../domain/planningConfig";

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
      const hasMainMeal = (savedMeal?.recipeIds.length ?? 0) > 0;
      const alreadyHas = savedMeal?.dessertIds?.includes(copyState.recipeId) ?? false;
      if (hasMainMeal && !alreadyHas && canAddDessert({ dessertIds: savedMeal?.dessertIds })) {
        dessertCopyTargetState = copyTargets.has(`${day}|${mealType.id}`) ? "selected" : "selectable";
      }
    }
  }

  return { multiCopyTargetState, dessertCopyTargetState, copySourceDessertId, isCopyRelevant };
}
