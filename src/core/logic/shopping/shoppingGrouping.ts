import { ConsolidatedIngredient, IngredientGroup, ShoppingAisle, ShoppingView } from "../../domain/shopping";
import { distributeToColumns } from "../../utils/columnUtils";
import { isCoveredAtHome } from "./shoppingChecks";

const OTHERS_GROUP_KEY = "others";
export const HOUSEHOLD_EXTRAS_GROUP_KEY = "household-extras";

function isHouseholdExtra(ingredient: ConsolidatedIngredient): boolean {
  return ingredient.origin === "extra" && ingredient.aisle.kind === "household";
}

function customCategoryIdOf(ingredient: ConsolidatedIngredient): string | null {
  return ingredient.origin === "extra" && ingredient.aisle.kind === "custom" ? ingredient.aisle.customCategoryId : null;
}

function belongsToAisle(ingredient: ConsolidatedIngredient, aisle: ShoppingAisle): boolean {
  if (isHouseholdExtra(ingredient)) return false;
  const customCategoryId = customCategoryIdOf(ingredient);
  if (aisle.kind === "custom") return customCategoryId === aisle.id;
  return customCategoryId === null && ingredient.category === aisle.category;
}

function groupByCategory(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
  keep: (ingredient: ConsolidatedIngredient) => boolean = () => true,
): IngredientGroup[] {
  const groups: IngredientGroup[] = aisles
    .map((aisle) => ({ key: aisle.id, label: aisle.label, list: ingredients.filter((i) => belongsToAisle(i, aisle) && keep(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => !isHouseholdExtra(i) && !aisles.some((aisle) => belongsToAisle(i, aisle)) && keep(i));
  if (uncategorized.length > 0) groups.push({ key: OTHERS_GROUP_KEY, label: "Autres", list: uncategorized });
  const household = ingredients.filter((i) => isHouseholdExtra(i) && keep(i));
  if (household.length > 0) groups.push({ key: HOUSEHOLD_EXTRAS_GROUP_KEY, label: "Articles du quotidien", list: household });
  return groups;
}

export function groupIngredients(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
): IngredientGroup[] {
  return groupByCategory(ingredients, aisles);
}

export function isLineDone(
  ingredient: ConsolidatedIngredient,
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): boolean {
  return checked.has(ingredient.key) || isCoveredAtHome(ingredient, stocks, sourceChecked);
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  aisles: readonly ShoppingAisle[],
  view: ShoppingView,
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, aisles, (i) => view === "all" || !isLineDone(i, checked, stocks, sourceChecked));
}

export function splitHouseholdExtrasGroup(groups: IngredientGroup[]): { aisles: IngredientGroup[]; householdExtras: ConsolidatedIngredient[] } {
  return {
    aisles: groups.filter((g) => g.key !== HOUSEHOLD_EXTRAS_GROUP_KEY),
    householdExtras: groups.find((g) => g.key === HOUSEHOLD_EXTRAS_GROUP_KEY)?.list ?? [],
  };
}

export function sortDoneLast(list: ConsolidatedIngredient[], isDone: (item: ConsolidatedIngredient) => boolean): ConsolidatedIngredient[] {
  return [...list.filter((i) => !isDone(i)), ...list.filter(isDone)];
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
