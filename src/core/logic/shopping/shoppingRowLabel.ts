import { ConsolidatedIngredient } from "../../domain/shopping";
import { formatQty, pluralizeUnit } from "../unit/unitFormatLogic";
import { effectiveQuantity, remainingToBuy } from "./shoppingChecks";

export interface ShoppingRowQuantity {
  main: string;
  positive: boolean;
}

export function formatShoppingQuantity(quantity: number, unit: string): string {
  return `${formatQty(quantity)} ${pluralizeUnit(unit, quantity)}`.trim();
}

export function shoppingRowQuantity(
  item: ConsolidatedIngredient,
  stock: number,
  sourceChecked: Set<string>,
): ShoppingRowQuantity {
  if (item.totalQuantity <= 0) return { main: item.origin === "extra" ? "" : "—", positive: false };
  const effective = effectiveQuantity(item, sourceChecked);
  const needed = remainingToBuy(item, { [item.key]: stock }, sourceChecked);
  if (effective === 0) return { main: "déjà pris", positive: true };
  if (needed === 0) return { main: "en stock", positive: true };
  return { main: formatShoppingQuantity(needed, item.unit), positive: false };
}

export function shoppingItemSummary(item: ConsolidatedIngredient, stock: number, sourceChecked: Set<string>): string {
  if (item.totalQuantity <= 0) return "Sans quantité";
  const effective = effectiveQuantity(item, sourceChecked);
  const needed = remainingToBuy(item, { [item.key]: stock }, sourceChecked);
  const parts = [`Total ${formatShoppingQuantity(effective, item.unit)}`];
  if (stock > 0) parts.push(`en stock ${formatShoppingQuantity(stock, item.unit)}`);
  parts.push(needed === 0 ? "rien à acheter" : `à acheter ${formatShoppingQuantity(needed, item.unit)}`);
  return parts.join(" · ");
}
