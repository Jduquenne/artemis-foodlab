import { Food, UNIT_WEIGHT_UNITS, Unit } from "../../domain/ingredient";
import { FoodPrice, PriceStore } from "../../domain/price";
import { roundTo } from "../../utils/numberUtils";
import { toGrams } from "../nutrition/macroLogic";
import { parseUnit } from "../unit/unitLogic";

export const PRICE_PER_KG_DECIMALS = 4;
export const PAID_TOTAL_DECIMALS = 2;
export const PURCHASED_GRAMS_DECIMALS = 3;

export interface PricedLine {
  key: string;
  name: string;
  foodId?: string;
  quantity: number;
  unit: string;
}

export interface CostEstimate {
  total: number;
  missing: PricedLine[];
}

export function effectivePriceStoreId(priceStoreId: string | null | undefined, stores: readonly PriceStore[]): string | null {
  if (priceStoreId && stores.some((s) => s.id === priceStoreId)) return priceStoreId;
  return stores.length === 1 ? stores[0].id : null;
}

export function latestPricesByFood(prices: readonly FoodPrice[], storeId: string | null): Map<string, FoodPrice> {
  const byFood = new Map<string, FoodPrice>();
  if (!storeId) return byFood;
  for (const price of prices) {
    if (price.storeId !== storeId) continue;
    const current = byFood.get(price.foodId);
    if (!current || price.recordedAt > current.recordedAt) byFood.set(price.foodId, price);
  }
  return byFood;
}

export function isLiquidUnit(unit: string): boolean {
  return parseUnit(unit) === Unit.ML;
}

export function quantityInGrams(quantity: number, unit: string, food: Food | undefined): number | null {
  return toGrams(quantity, parseUnit(unit), food?.unitWeight);
}

export function costOfQuantity(quantity: number, unit: string, food: Food | undefined, pricePerKg: number | undefined): number | null {
  if (pricePerKg === undefined || quantity <= 0) return null;
  const grams = quantityInGrams(quantity, unit, food);
  return grams === null ? null : (grams / 1000) * pricePerKg;
}

export function costPerPiece(unit: string, food: Food | undefined, pricePerKg: number): number | null {
  return UNIT_WEIGHT_UNITS.includes(parseUnit(unit)) ? costOfQuantity(1, unit, food, pricePerKg) : null;
}

export function lineCost(line: PricedLine, foods: Record<string, Food>, prices: Map<string, FoodPrice>): number | null {
  if (!line.foodId) return null;
  return costOfQuantity(line.quantity, line.unit, foods[line.foodId], prices.get(line.foodId)?.pricePerKg);
}

export function estimateCost(lines: readonly PricedLine[], foods: Record<string, Food>, prices: Map<string, FoodPrice>): CostEstimate {
  let total = 0;
  const missing: PricedLine[] = [];
  for (const line of lines) {
    if (line.quantity <= 0) continue;
    const cost = lineCost(line, foods, prices);
    if (cost === null) missing.push(line);
    else total += cost;
  }
  return { total, missing };
}

export function pricePerKgFrom(paidTotal: number, grams: number): number | null {
  return paidTotal > 0 && grams > 0 ? roundTo((paidTotal * 1000) / grams, PRICE_PER_KG_DECIMALS) : null;
}

export function paidTotalFrom(pricePerKg: number, grams: number): number | null {
  return pricePerKg > 0 && grams > 0 ? roundTo((pricePerKg * grams) / 1000, PAID_TOTAL_DECIMALS) : null;
}

export function gramsFrom(paidTotal: number, pricePerKg: number): number | null {
  return paidTotal > 0 && pricePerKg > 0 ? roundTo((paidTotal * 1000) / pricePerKg, PURCHASED_GRAMS_DECIMALS) : null;
}

export function formatEuro(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} €`;
}

export function formatEuroRounded(amount: number): string {
  return amount > 0 && amount < 1 ? "< 1 €" : `${Math.round(amount)} €`;
}

export type PriceEntryField = "quantity" | "paid" | "perKg";

export interface PriceEntryValues {
  quantity: number | null;
  paid: number | null;
  perKg: number | null;
}

export interface CompletedPriceEntry {
  values: PriceEntryValues;
  computed: PriceEntryField | null;
}

const ENTRY_FIELDS: readonly PriceEntryField[] = ["quantity", "paid", "perKg"];

export function touchPriceEntryField(touched: readonly PriceEntryField[], field: PriceEntryField): PriceEntryField[] {
  return [...touched.filter((f) => f !== field), field].slice(-2);
}

export function completePriceEntry(
  values: PriceEntryValues,
  touched: readonly PriceEntryField[],
  gramsPerUnit: number,
): CompletedPriceEntry {
  const free = ENTRY_FIELDS.find((f) => !touched.includes(f)) ?? null;
  const grams = values.quantity !== null ? values.quantity * gramsPerUnit : 0;
  if (free === "paid" && values.perKg) {
    const paid = paidTotalFrom(values.perKg, grams);
    return { values: { ...values, paid }, computed: paid === null ? null : "paid" };
  }
  if (free === "perKg" && values.paid) {
    const perKg = pricePerKgFrom(values.paid, grams);
    return { values: { ...values, perKg }, computed: perKg === null ? null : "perKg" };
  }
  if (free === "quantity" && values.paid && values.perKg) {
    const computedGrams = gramsFrom(values.paid, values.perKg);
    const quantity = computedGrams === null ? null : roundTo(computedGrams / gramsPerUnit, 2);
    return { values: { ...values, quantity }, computed: quantity === null ? null : "quantity" };
  }
  return { values, computed: null };
}

export interface PriceEntryPayload {
  pricePerKg: number;
  paidTotal?: number;
  purchasedGrams?: number;
}

export function priceEntryPayload(values: PriceEntryValues, gramsPerUnit: number | null): PriceEntryPayload | null {
  if (!values.perKg || values.perKg <= 0) return null;
  const pricePerKg = roundTo(values.perKg, PRICE_PER_KG_DECIMALS);
  if (gramsPerUnit === null || !values.paid || !values.quantity) return { pricePerKg };
  return {
    pricePerKg,
    paidTotal: roundTo(values.paid, PAID_TOTAL_DECIMALS),
    purchasedGrams: roundTo(values.quantity * gramsPerUnit, PURCHASED_GRAMS_DECIMALS),
  };
}

export function lineCosts(lines: readonly PricedLine[], foods: Record<string, Food>, prices: Map<string, FoodPrice>): Map<string, number | null> {
  return new Map(lines.filter((line) => line.quantity > 0).map((line) => [line.key, lineCost(line, foods, prices)]));
}
