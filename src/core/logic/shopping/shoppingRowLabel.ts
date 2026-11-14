import { ConsolidatedIngredient, ShoppingMode } from "../../domain/shopping";
import { formatQty, pluralizeUnit } from "../unit/unitFormatLogic";
import { effectiveQuantity, remainingToBuy } from "./shoppingChecks";

export type HomeStockState = "none" | "partial" | "full";

export interface ShoppingRowQuantity {
  main: string;
  sub: string | null;
  positive: boolean;
}

export function formatShoppingQuantity(quantity: number, unit: string): string {
  return `${formatQty(quantity)} ${pluralizeUnit(unit, quantity)}`.trim();
}

export function homeStockState(item: ConsolidatedIngredient, stock: number, sourceChecked: Set<string>): HomeStockState {
  if (item.totalQuantity > 0 && remainingToBuy(item, { [item.key]: stock }, sourceChecked) === 0) return "full";
  return stock > 0 ? "partial" : "none";
}

export function shoppingRowQuantity(
  item: ConsolidatedIngredient,
  mode: ShoppingMode,
  stock: number,
  sourceChecked: Set<string>,
): ShoppingRowQuantity {
  if (item.totalQuantity <= 0) return { main: item.isExtra ? "" : "—", sub: null, positive: false };
  const effective = effectiveQuantity(item, sourceChecked);
  const needed = remainingToBuy(item, { [item.key]: stock }, sourceChecked);
  if (mode === "store") {
    return { main: formatShoppingQuantity(needed, item.unit), sub: stock > 0 ? `sur ${formatShoppingQuantity(effective, item.unit)}` : null, positive: false };
  }
  if (effective === 0) return { main: "déjà pris", sub: null, positive: true };
  if (needed === 0) return { main: "j'ai tout", sub: formatShoppingQuantity(effective, item.unit), positive: true };
  if (stock > 0) return { main: formatShoppingQuantity(needed, item.unit), sub: `j'ai ${formatShoppingQuantity(stock, item.unit)}`, positive: false };
  return { main: formatShoppingQuantity(effective, item.unit), sub: null, positive: false };
}

export function shoppingItemSummary(item: ConsolidatedIngredient, stock: number, sourceChecked: Set<string>): string {
  if (item.totalQuantity <= 0) return "Sans quantité";
  const effective = effectiveQuantity(item, sourceChecked);
  const needed = remainingToBuy(item, { [item.key]: stock }, sourceChecked);
  const parts = [`Total ${formatShoppingQuantity(effective, item.unit)}`];
  if (stock > 0) parts.push(`j'ai ${formatShoppingQuantity(stock, item.unit)}`);
  parts.push(needed === 0 ? "rien à acheter" : `à acheter ${formatShoppingQuantity(needed, item.unit)}`);
  return parts.join(" · ");
}
