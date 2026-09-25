import { FoodFreezerItem, FreezerBag, FreezerCategory, FreezerItem } from "../../domain/freezer";
import { isBatchItem, isFoodItem } from "../../domain/freezerPredicates";
import { formatQty, pluralizeUnit } from "../../../shared/utils/unitUtils";
import { groupBy, sumBy } from "../../../shared/utils/collectionUtils";
import { toNumber } from "../../../shared/utils/numberUtils";

export function bagQuantity(bag: Pick<FreezerBag, "quantity">): number {
  return toNumber(bag.quantity);
}

export function totalBagQuantity(bags: readonly FreezerBag[]): number {
  return sumBy(bags, bagQuantity);
}

type LinkedFoodItem = FoodFreezerItem & { foodId: string };

function isLinkedFoodItem(item: FreezerItem): item is LinkedFoodItem {
  return isFoodItem(item) && Boolean(item.foodId);
}

function flattenFreezerItems(categories: FreezerCategory[]): FreezerItem[] {
  return categories.flatMap((category) => category.items);
}

export function getFoodBagsSummary(item: FoodFreezerItem): string {
  const count = item.bags.length;
  if (count === 0) return "Vide";
  const bagsLabel = `${count} sac${count > 1 ? "s" : ""}`;
  const units = new Set(item.bags.map((b) => b.unit));
  if (units.size === 1) {
    const unit = item.bags[0].unit;
    const total = totalBagQuantity(item.bags);
    return `${bagsLabel} · ${formatQty(total)}${unit ? " " + pluralizeUnit(unit, total) : ""}`;
  }
  return bagsLabel;
}

export function getBatchRecipeIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  return new Set(
    flattenFreezerItems(categories)
      .filter(isBatchItem)
      .filter((item) => item.portions > 0)
      .map((item) => item.recipeId),
  );
}

export function getFoodIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  const ids = new Set<string>();
  for (const item of flattenFreezerItems(categories).filter(isFoodItem)) {
    if (item.foodId && totalBagQuantity(item.bags) > 0) ids.add(item.foodId);
  }
  return ids;
}

export function getFoodBagsInFreezer(categories: FreezerCategory[]): Map<string, FreezerBag[]> {
  const linkedFoodItems = flattenFreezerItems(categories).filter(isLinkedFoodItem);
  const byFood = groupBy(linkedFoodItems, (item) => item.foodId);
  const result = new Map<string, FreezerBag[]>();
  for (const [foodId, items] of byFood) {
    const bags = items.flatMap((item) => item.bags).filter((bag) => bagQuantity(bag) > 0);
    if (bags.length > 0) result.set(foodId, bags);
  }
  return result;
}

export function computeFreezerBagSelection(
  current: string[],
  bagId: string,
  allBags: FreezerBag[],
): { next: string[]; total: number } {
  const isSelected = current.includes(bagId);
  const next = isSelected ? current.filter(id => id !== bagId) : [...current, bagId];
  const total = next.reduce((sum, id) => {
    const bag = allBags.find(b => b.id === id);
    return sum + (bag ? bagQuantity(bag) : 0);
  }, 0);
  return { next, total };
}

export interface FreezerCategorySummary {
  total: number;
  foodCount: number;
  batchCount: number;
  portions: number;
}

export function summarizeFreezerCategory(category: FreezerCategory): FreezerCategorySummary {
  let foodCount = 0;
  let batchCount = 0;
  let portions = 0;
  for (const item of category.items) {
    if (item.type === 'batch') {
      batchCount++;
      portions += toNumber(item.portions);
    } else {
      foodCount++;
    }
  }
  return { total: category.items.length, foodCount, batchCount, portions };
}
