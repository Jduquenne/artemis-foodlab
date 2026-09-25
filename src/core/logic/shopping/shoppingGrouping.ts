import { IngredientCategory } from "../../domain/ingredient";
import { ConsolidatedIngredient, IngredientGroup } from "../../domain/shopping";
import { distributeToColumns } from "../../../shared/utils/columnUtils";
import { isIngredientNeeded } from "./shoppingChecks";

const SHOPPING_CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.FRUIT_VEGETABLE,
  IngredientCategory.MEAT,
  IngredientCategory.FISH,
  IngredientCategory.DELI,
  IngredientCategory.DAIRY,
  IngredientCategory.FARM,
  IngredientCategory.BAKERY,
  IngredientCategory.STARCH,
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.DRIED_FRUIT,
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
  IngredientCategory.FROZEN,
  IngredientCategory.RECIPE,
  IngredientCategory.INTERNET,
  IngredientCategory.NON_PURCHASE,
  IngredientCategory.UNKNOWN,
];

function groupByCategory(
  ingredients: ConsolidatedIngredient[],
  keep: (ingredient: ConsolidatedIngredient) => boolean = () => true,
): IngredientGroup[] {
  const groups: IngredientGroup[] = SHOPPING_CATEGORY_ORDER
    .map((cat) => ({ label: cat as string, list: ingredients.filter((i) => i.category === cat && keep(i)) }))
    .filter((g) => g.list.length > 0);
  const uncategorized = ingredients.filter((i) => (!i.category || !SHOPPING_CATEGORY_ORDER.includes(i.category)) && keep(i));
  if (uncategorized.length > 0) groups.push({ label: "Autres", list: uncategorized });
  return groups;
}

export function groupIngredients(ingredients: ConsolidatedIngredient[]): IngredientGroup[] {
  return groupByCategory(ingredients);
}

export function filterGroupedIngredients(
  ingredients: ConsolidatedIngredient[],
  filter: "all" | "missing",
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): IngredientGroup[] {
  return groupByCategory(ingredients, (i) => filter === "all" || isIngredientNeeded(i, checked, stocks, sourceChecked));
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
