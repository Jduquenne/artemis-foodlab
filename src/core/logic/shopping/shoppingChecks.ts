import { HouseholdItem } from "../../domain/household";
import { ConsolidatedIngredient, IngredientSource, RecipeCardIngredient } from "../../domain/shopping";
import { sumBy } from "../../../shared/utils/collectionUtils";

export function buildSourceCheckKey(
  ingredientKey: string,
  source: Pick<IngredientSource, "recipeId" | "day" | "slot">
): string {
  return `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
}

export function checkedSourcesQuantity(ing: ConsolidatedIngredient, sourceChecked: Set<string>): number {
  return sumBy(
    ing.sources.filter((s) => sourceChecked.has(buildSourceCheckKey(ing.key, s))),
    (s) => s.quantity,
  );
}

export function remainingToBuy(
  ing: ConsolidatedIngredient,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): number {
  if (ing.totalQuantity === 0) return 0;
  const effective = Math.max(0, ing.totalQuantity - checkedSourcesQuantity(ing, sourceChecked));
  return Math.max(0, effective - (stocks[ing.key] ?? 0));
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
