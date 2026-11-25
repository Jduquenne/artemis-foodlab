import { BaseVersionChoice } from "../../domain/baseVersion";
import { BatchFreezerItem, BatchUnit, FreezerCategory } from "../../domain/freezer";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { compareByName } from "../../utils/sortUtils";
import { includesText, normalizeQuery } from "../../utils/textUtils";
import { reachableBaseCodes } from "../baseVersion/baseVersionLogic";
import { basePortionsOf, cookedWeightPerPortion } from "../recipe/cookedWeightLogic";
import { portionsPerPersonOf } from "../recipe/portionsPerPersonLogic";
import { formatBatchQuantity, isValidBatchQuantity } from "./batchQuantityLogic";
import { formatQty } from "../unit/unitFormatLogic";

export function isBaseBatch(item: BatchFreezerItem, recipes: Record<string, RecipeDetails>): boolean {
  return recipes[item.recipeId]?.kind === RecipeKind.BASE;
}

export function dishesUsingBase(recipes: Record<string, RecipeDetails>, baseCode: string): RecipeDetails[] {
  return Object.values(recipes)
    .filter((recipe) => recipe.kind === RecipeKind.DISH && reachableBaseCodes(recipe, recipes).has(baseCode))
    .sort(compareByName);
}

export function filterDishesByName(dishes: readonly RecipeDetails[], query: string): RecipeDetails[] {
  const normalized = normalizeQuery(query);
  return normalized ? dishes.filter((dish) => includesText(dish.name, normalized)) : [...dishes];
}

function basePortionsPerRecipe(
  recipe: RecipeDetails,
  baseCode: string,
  recipes: Record<string, RecipeDetails>,
  visited: ReadonlySet<string>,
): number {
  let total = 0;
  for (const ingredient of recipe.ingredients) {
    if (ingredient.link !== "base") continue;
    const base = recipes[ingredient.baseId];
    if (!base || visited.has(ingredient.baseId)) continue;
    const portions = basePortionsOf(ingredient.quantity ?? 0, ingredient.unit, base) ?? 0;
    if (ingredient.baseId === baseCode) {
      total += portions;
      continue;
    }
    const nested = basePortionsPerRecipe(base, baseCode, recipes, new Set([...visited, ingredient.baseId]));
    total += (nested * portions) / Math.max(base.defaultPortions, 1);
  }
  return total;
}

export function suggestedFrozenQuantity(
  dish: RecipeDetails,
  base: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  persons: number,
  unit: BatchUnit,
): number | null {
  const scale = (persons * portionsPerPersonOf(dish)) / Math.max(dish.defaultPortions, 1);
  const basePortions = basePortionsPerRecipe(dish, base.code, recipes, new Set([dish.code])) * scale;
  if (basePortions <= 0) return null;
  if (unit === "portion") return Math.max(1, Math.round(basePortions));
  const perPortion = cookedWeightPerPortion(base);
  return perPortion === null ? null : Math.max(1, Math.round(basePortions * perPortion));
}

export function initialFrozenQuantity(suggested: number | null, available: number): number | null {
  return suggested === null ? null : Math.min(suggested, available);
}

export function frozenQuantityError(unit: BatchUnit, quantity: number | null, available: number): string | null {
  if (quantity === null || !isValidBatchQuantity(unit, quantity)) {
    return unit === "portion"
      ? "Indique un nombre entier de portions, au moins 1."
      : "Indique une quantité supérieure à 0 (3 décimales au maximum).";
  }
  if (quantity > available) return `Il ne reste que ${formatBatchQuantity(unit, available)} au congélateur.`;
  return null;
}

export function frozenChoiceLabels(
  choices: readonly BaseVersionChoice[],
  categories: readonly FreezerCategory[],
): Record<string, string> {
  const batches = new Map(categories.flatMap((category) => category.items).map((item) => [item.id, item]));
  const labels: Record<string, string> = {};
  for (const choice of choices) {
    if (choice.version !== "frozen") continue;
    const batch = batches.get(choice.freezerItemId);
    labels[choice.baseCode] = batch?.type === "batch" ? formatBatchQuantity(batch.unit, choice.quantity) : formatQty(choice.quantity);
  }
  return labels;
}

export function withFrozenBase(
  choices: readonly BaseVersionChoice[],
  baseCode: string,
  item: BatchFreezerItem,
  quantity: number,
): BaseVersionChoice[] {
  return [
    ...choices.filter((choice) => choice.baseCode !== baseCode),
    { baseCode, version: "frozen", freezerItemId: item.id, quantity },
  ];
}
