import { HouseholdItem } from "../../domain/household";
import { ConsolidatedIngredient, IngredientSource, RecipeCardIngredient } from "../../domain/shopping";
import { sumBy } from "../../utils/collectionUtils";
import { roundTo } from "../../utils/numberUtils";

export const SHOPPING_QUANTITY_DECIMALS = 2;

export function buildSourceCheckKey(
  ingredientKey: string,
  source: Pick<IngredientSource, "recipeId" | "day" | "slot">
): string {
  return `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
}

function checkedSourcesQuantity(ing: ConsolidatedIngredient, sourceChecked: Set<string>): number {
  return sumBy(
    ing.sources.filter((s) => sourceChecked.has(buildSourceCheckKey(ing.key, s))),
    (s) => s.quantity,
  );
}

export function effectiveQuantity(ing: ConsolidatedIngredient, sourceChecked: Set<string>): number {
  return roundTo(Math.max(0, ing.totalQuantity - checkedSourcesQuantity(ing, sourceChecked)), SHOPPING_QUANTITY_DECIMALS);
}

export function remainingToBuy(
  ing: ConsolidatedIngredient,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): number {
  if (ing.totalQuantity === 0) return 0;
  return roundTo(Math.max(0, effectiveQuantity(ing, sourceChecked) - (stocks[ing.key] ?? 0)), SHOPPING_QUANTITY_DECIMALS);
}

export function isIngredientNeeded(
  ing: ConsolidatedIngredient,
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): boolean {
  if (checked.has(ing.key)) return false;
  return ing.totalQuantity === 0 || remainingToBuy(ing, stocks, sourceChecked) > 0;
}

export function isCoveredAtHome(
  ing: ConsolidatedIngredient,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): boolean {
  return ing.totalQuantity > 0 && remainingToBuy(ing, stocks, sourceChecked) === 0;
}

export function countRecipes(ing: ConsolidatedIngredient): number {
  return new Set(ing.sources.map((s) => s.recipeId)).size;
}

export function checkableCardIngredients(
  ingredients: RecipeCardIngredient[],
  checkableKeys: ReadonlySet<string>,
): RecipeCardIngredient[] {
  return ingredients.filter((ing) => checkableKeys.has(ing.ingredientKey));
}

export function isIngChecked(ing: RecipeCardIngredient, sourceChecked: Set<string>): boolean {
  return ing.sources.length > 0 && ing.sources.every(
    (s) => sourceChecked.has(buildSourceCheckKey(ing.ingredientKey, s))
  );
}

export function computeUncheckedCount(
  ingredients: ConsolidatedIngredient[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
  householdItems: HouseholdItem[],
): number {
  const ingredientUnchecked = ingredients.filter((i) => isIngredientNeeded(i, checked, stocks, sourceChecked)).length;
  const householdUnchecked = householdItems.filter((i) => !checked.has(`household::${i.id}`)).length;
  return ingredientUnchecked + householdUnchecked;
}
