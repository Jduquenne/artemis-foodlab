import { FreezerCategory, FreezerItem } from "../../domain/freezer";
import { isFoodItem } from "../../domain/freezerPredicates";
import { isFreezerFoodNameTaken } from "./freezerItemsLogic";

export interface FreezerMoveTarget {
  category: FreezerCategory;
  blockedReason: string | null;
}

export const FREEZER_MOVE_DUPLICATE_REASON = "Déjà présent";

export function freezerMoveTargets(
  categories: readonly FreezerCategory[],
  sourceCategoryId: string,
  item: FreezerItem,
): FreezerMoveTarget[] {
  return categories
    .filter((category) => category.id !== sourceCategoryId)
    .map((category) => {
      const names = category.items.filter(isFoodItem).map((existing) => existing.name);
      const duplicate = isFoodItem(item) && isFreezerFoodNameTaken(names, item.name);
      return { category, blockedReason: duplicate ? FREEZER_MOVE_DUPLICATE_REASON : null };
    });
}

export function freezerItemLabel(item: FreezerItem): string {
  return isFoodItem(item) ? item.name : item.recipeName;
}
