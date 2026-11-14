import { Food, Unit } from "../../domain/ingredient";
import { FoodPrice, PriceStore } from "../../domain/price";
import { roundTo } from "../../utils/numberUtils";
import { toGrams } from "../nutrition/macroLogic";
import { parseUnit } from "../unit/unitLogic";

export const PRICE_PER_KG_DECIMALS = 4;
export const PAID_TOTAL_DECIMALS = 2;
export const PURCHASED_GRAMS_DECIMALS = 3;

export interface PricedLine {
  foodId?: string;
  quantity: number;
  unit: string;
}

export interface CostEstimate {
  total: number;
  missingCount: number;
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

export function lineCost(line: PricedLine, foods: Record<string, Food>, prices: Map<string, FoodPrice>): number | null {
  if (!line.foodId) return null;
  return costOfQuantity(line.quantity, line.unit, foods[line.foodId], prices.get(line.foodId)?.pricePerKg);
}

export function estimateCost(lines: readonly PricedLine[], foods: Record<string, Food>, prices: Map<string, FoodPrice>): CostEstimate {
  let total = 0;
  let missingCount = 0;
  for (const line of lines) {
    const cost = lineCost(line, foods, prices);
    if (cost === null) missingCount += 1;
    else total += cost;
  }
  return { total, missingCount };
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
