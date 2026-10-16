import { IngredientCategory } from "../../domain/ingredient";
import { ConsolidatedIngredient, IngredientGroup } from "../../domain/shopping";
import { distributeToColumns } from "../../utils/columnUtils";
import { isIngredientNeeded } from "./shoppingChecks";

function groupByCategory(
  ingredients: ConsolidatedIngredient[],
  order: readonly IngredientCategory[],
  keep: (ingredient: ConsolidatedIngredient) => boolean = () => true,
): IngredientGroup[] {
  const groups: IngredientGroup[] = order
    .map((cat) => ({ label: cat as string, list: ingredients.filter((i) => i.category === cat && keep(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => (!i.category || !order.includes(i.category)) && keep(i));
  if (uncategorized.length > 0) groups.push({ label: "Autres", list: uncategorized });
  return groups;
}

export function groupIngredients(
  ingredients: ConsolidatedIngredient[],
  order: readonly IngredientCategory[],
): IngredientGroup[] {
  return groupByCategory(ingredients, order);
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  order: readonly IngredientCategory[],
  filter: "all" | "missing",
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, order, (i) => filter === "all" || isIngredientNeeded(i, checked, stocks, sourceChecked));
}

export function assignIngredientColumns(
  allGroups: IngredientGroup[],
  filteredGroups: IngredientGroup[],
  colCount: number,
): IngredientGroup[][] {
  const stableAssignment = distributeToColumns(allGroups, (g) => g.list.length, colCount);
  const colForLabel = new Map<string, number>();
  stableAssignment.forEach((col, ci) => col.forEach((g) => colForLabel.set(g.label, ci)));
  const cols: IngredientGroup[][] = Array.from({ length: colCount }, () => []);
  for (const group of filteredGroups) {
    const ci = colForLabel.get(group.label) ?? 0;
    cols[ci].push(group);
  }
  return cols;
}
