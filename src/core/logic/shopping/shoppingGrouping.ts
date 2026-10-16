import { ConsolidatedIngredient, IngredientGroup, ShoppingAisle } from "../../domain/shopping";
import { distributeToColumns } from "../../utils/columnUtils";
import { isIngredientNeeded } from "./shoppingChecks";

const OTHERS_GROUP_KEY = "others";

function belongsToAisle(ingredient: ConsolidatedIngredient, aisle: ShoppingAisle): boolean {
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
  const uncategorized = ingredients.filter((i) => !aisles.some((aisle) => belongsToAisle(i, aisle)) && keep(i));
  if (uncategorized.length > 0) groups.push({ key: OTHERS_GROUP_KEY, label: "Autres", list: uncategorized });
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
  filter: "all" | "missing",
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, aisles, (i) => filter === "all" || isIngredientNeeded(i, checked, stocks, sourceChecked));
}

export function assignIngredientColumns(
  allGroups: IngredientGroup[],
  filteredGroups: IngredientGroup[],
  colCount: number,
): IngredientGroup[][] {
  const stableAssignment = distributeToColumns(allGroups, (g) => g.list.length, colCount);
  const colForKey = new Map<string, number>();
  stableAssignment.forEach((col, ci) => col.forEach((g) => colForKey.set(g.key, ci)));
  const cols: IngredientGroup[][] = Array.from({ length: colCount }, () => []);
  for (const group of filteredGroups) {
    const ci = colForKey.get(group.key) ?? 0;
    cols[ci].push(group);
  }
  return cols;
}
