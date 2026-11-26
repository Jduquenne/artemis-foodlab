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

export function linkedQuantityLabel(unit: BatchUnit, linkedQuantity: number): string | null {
  if (linkedQuantity <= 0) return null;
  const plural = linkedQuantity > 1 ? "s" : "";
  const agreement = unit === "portion" ? `e${plural}` : plural;
  return `${formatBatchQuantity(unit, linkedQuantity)} prévu${agreement} au menu`;
}

export function batchStatusLabel(unit: BatchUnit, quantity: number, linkedQuantity: number): string {
  if (quantity === 0) return linkedQuantity > 0 ? "Épuisé · prévu au menu" : "Épuisé";
  const linked = linkedQuantityLabel(unit, linkedQuantity);
  return linked ? `${formatBatchQuantity(unit, quantity)} · ${linked}` : formatBatchQuantity(unit, quantity);
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

export function plannedBatchDeleteConsequence(unit: BatchUnit, linkedQuantity: number): string {
  const linked = linkedQuantityLabel(unit, linkedQuantity) ?? "Une quantité prévue au menu";
  return `Ce lot a ${linked}. Les repas concernés repasseront en version maison : la base sera de nouveau à préparer et ses ingrédients dans les courses.`;
}
