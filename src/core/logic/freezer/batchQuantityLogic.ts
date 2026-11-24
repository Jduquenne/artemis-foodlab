import { BatchUnit } from "../../domain/freezer";
import { roundTo } from "../../utils/numberUtils";
import { formatQty } from "../unit/unitFormatLogic";

const BATCH_GRAM_DECIMALS = 3;

export const BATCH_UNITS: readonly BatchUnit[] = ["portion", "g"];

export const BATCH_UNIT_LABELS: Record<BatchUnit, string> = { portion: "Portions", g: "Grammes" };

export const BATCH_UNIT_STEP: Record<BatchUnit, number> = { portion: 1, g: 50 };

export function formatBatchQuantity(unit: BatchUnit, quantity: number): string {
  if (unit === "g") return `${formatQty(quantity)} g`;
  return `${quantity} portion${quantity > 1 ? "s" : ""}`;
}

export function shortBatchQuantity(unit: BatchUnit, quantity: number): string {
  return unit === "g" ? `${formatQty(quantity)} g` : String(quantity);
}

export function canDecrementBatch(unit: BatchUnit, quantity: number): boolean {
  return quantity - BATCH_UNIT_STEP[unit] > 0;
}

export function steppedBatchQuantity(unit: BatchUnit, quantity: number, direction: 1 | -1): number {
  return roundTo(quantity + direction * BATCH_UNIT_STEP[unit], BATCH_GRAM_DECIMALS);
}

export function isValidBatchQuantity(unit: BatchUnit, quantity: number): boolean {
  if (quantity <= 0) return false;
  return unit === "portion" ? Number.isInteger(quantity) : roundTo(quantity, BATCH_GRAM_DECIMALS) === quantity;
}
