import { ConsolidatedIngredient } from "../../domain/shopping";
import { PricedLine } from "../price/priceLogic";
import { isIngredientNeeded, remainingToBuy } from "./shoppingChecks";

export function shoppingLinesToPrice(
  ingredients: readonly ConsolidatedIngredient[],
  checked: Set<string>,
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): PricedLine[] {
  return ingredients
    .filter((ing) => isIngredientNeeded(ing, checked, stocks, sourceChecked))
    .map((ing) => ({
      key: ing.key,
      name: ing.name,
      foodId: ing.foodId,
      quantity: remainingToBuy(ing, stocks, sourceChecked),
      unit: ing.unit,
    }));
}
