import { ConsolidatedIngredient, IngredientGroup, ShoppingAisle, ShoppingMode } from "../../domain/shopping";
import { distributeToColumns } from "../../utils/columnUtils";
import { isCoveredAtHome } from "./shoppingChecks";

const OTHERS_GROUP_KEY = "others";
export const HOUSEHOLD_EXTRAS_GROUP_KEY = "household-extras";

function belongsToAisle(ingredient: ConsolidatedIngredient, aisle: ShoppingAisle): boolean {
  if (ingredient.isHousehold) return false;
  if (aisle.kind === "custom") return ingredient.customCategoryId === aisle.id;
  return !ingredient.customCategoryId && ingredient.category === aisle.category;
}

function groupByCategory(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
  keep: (ingredient: ConsolidatedIngredient) => boolean = () => true,
): IngredientGroup[] {
  const groups: IngredientGroup[] = aisles
    .map((aisle) => ({ key: aisle.id, label: aisle.label, list: ingredients.filter((i) => belongsToAisle(i, aisle) && keep(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => !i.isHousehold && !aisles.some((aisle) => belongsToAisle(i, aisle)) && keep(i));
  if (uncategorized.length > 0) groups.push({ key: OTHERS_GROUP_KEY, label: "Autres", list: uncategorized });
  const household = ingredients.filter((i) => i.isHousehold && keep(i));
  if (household.length > 0) groups.push({ key: HOUSEHOLD_EXTRAS_GROUP_KEY, label: "Articles du quotidien", list: household });
  return groups;
}

export function groupIngredients(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
): IngredientGroup[] {
  return groupByCategory(ingredients, aisles);
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
  mode: ShoppingMode,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, aisles, (i) => mode === "home" || !isCoveredAtHome(i, stocks, sourceChecked));
}

export function countCoveredByGroup(
  groups: IngredientGroup[],
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): Record<string, number> {
  return Object.fromEntries(groups.map((g) => [g.key, g.list.filter((i) => isCoveredAtHome(i, stocks, sourceChecked)).length]));
}

export function splitHouseholdExtrasGroup(groups: IngredientGroup[]): { aisles: IngredientGroup[]; householdExtras: ConsolidatedIngredient[] } {
  return {
    aisles: groups.filter((g) => g.key !== HOUSEHOLD_EXTRAS_GROUP_KEY),
    householdExtras: groups.find((g) => g.key === HOUSEHOLD_EXTRAS_GROUP_KEY)?.list ?? [],
  };
}

export function sortCheckedLast(list: ConsolidatedIngredient[], checked: Set<string>): ConsolidatedIngredient[] {
  return [...list.filter((i) => !checked.has(i.key)), ...list.filter((i) => checked.has(i.key))];
}

export function assignIngredientColumns(
  allGroups: IngredientGroup[],
  filteredGroups: IngredientGroup[],
  colCount: number,
): IngredientGroup[][] {
  const stableAssignment = distributeToColumns(allGroups, (g) => g.list.length, colCount);
  const colForKey = new Map<string, number>();
  stableAssignment.forEach((col, ci) => col.forEach((g) => colForKey.set(g.key, ci)));
  return Array.from({ length: colCount }, (_, ci) =>
    filteredGroups.filter((group) => (colForKey.get(group.key) ?? 0) === ci),
  );
}
