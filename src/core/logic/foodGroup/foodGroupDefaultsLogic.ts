import { FoodGroupDefault } from "../../domain/foodGroup";
import { foldText } from "../../utils/textUtils";
import { FoodGroupWithFoods } from "./foodChoiceLogic";

export interface FoodGroupDefaultSections {
  defined: FoodGroupWithFoods[];
  others: FoodGroupWithFoods[];
}

export function definedFoodGroupIds(defaults: readonly FoodGroupDefault[]): Set<string> {
  return new Set(defaults.map((d) => d.foodGroupId));
}

export function countFoodGroupDefaults(entries: readonly FoodGroupWithFoods[], defaults: readonly FoodGroupDefault[]): number {
  const defined = definedFoodGroupIds(defaults);
  return entries.filter((entry) => defined.has(entry.group.id)).length;
}

function matchesFoodGroupQuery(entry: FoodGroupWithFoods, foldedQuery: string): boolean {
  if (!foldedQuery) return true;
  return foldText(entry.group.name).includes(foldedQuery)
    || entry.foods.some((food) => foldText(food.name).includes(foldedQuery));
}

export function foodGroupDefaultSections(
  entries: readonly FoodGroupWithFoods[],
  definedIds: ReadonlySet<string>,
  query: string,
): FoodGroupDefaultSections {
  const foldedQuery = foldText(query);
  const visible = entries.filter((entry) => matchesFoodGroupQuery(entry, foldedQuery));
  return {
    defined: visible.filter((entry) => definedIds.has(entry.group.id)),
    others: visible.filter((entry) => !definedIds.has(entry.group.id)),
  };
}
