import { ConsolidatedIngredient } from "../../domain/shopping";
import { roundTo } from "../../utils/numberUtils";
import { SHOPPING_QUANTITY_DECIMALS, effectiveQuantity } from "./shoppingChecks";
import { homeStockState } from "./shoppingRowLabel";

export interface StockUpdate {
  key: string;
  value: number;
}

export function usesHomeStock(item: ConsolidatedIngredient): boolean {
  return item.totalQuantity > 0 && item.origin !== "extra";
}

function neededQuantity(item: ConsolidatedIngredient, sourceChecked: Set<string>): number {
  return roundTo(effectiveQuantity(item, sourceChecked), SHOPPING_QUANTITY_DECIMALS);
}

export function quickStockValue(item: ConsolidatedIngredient, stock: number, sourceChecked: Set<string>): number {
  return homeStockState(item, stock, sourceChecked) === "full" ? 0 : neededQuantity(item, sourceChecked);
}

export function aisleInStockUpdates(
  items: readonly ConsolidatedIngredient[],
  stocks: Record<string, number>,
  sourceChecked: Set<string>,
): StockUpdate[] {
  return items
    .filter((item) => usesHomeStock(item) && homeStockState(item, stocks[item.key] ?? 0, sourceChecked) !== "full")
    .map((item) => ({ key: item.key, value: neededQuantity(item, sourceChecked) }));
}
