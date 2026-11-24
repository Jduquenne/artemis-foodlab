import { BatchUnit } from "../../domain/freezer";
import { roundTo } from "../../utils/numberUtils";
import { formatQty } from "../unit/unitFormatLogic";

const BATCH_GRAM_DECIMALS = 3;

export const BATCH_UNITS: readonly BatchUnit[] = ["portion", "g"];

export const BATCH_UNIT_LABELS: Record<BatchUnit, string> = { portion: "Portions", g: "Grammes" };

export function formatBatchQuantity(unit: BatchUnit, quantity: number): string {
  if (unit === "g") return `${formatQty(quantity)} g`;
  return `${quantity} portion${quantity > 1 ? "s" : ""}`;
}

export function shortBatchQuantity(unit: BatchUnit, quantity: number): string {
  return unit === "g" ? `${formatQty(quantity)} g` : String(quantity);
}

export function canRemovePortion(portions: number): boolean {
  return portions > 1;
}

export function isValidBatchQuantity(unit: BatchUnit, quantity: number): boolean {
  if (quantity <= 0) return false;
  return unit === "portion" ? Number.isInteger(quantity) : roundTo(quantity, BATCH_GRAM_DECIMALS) === quantity;
}
