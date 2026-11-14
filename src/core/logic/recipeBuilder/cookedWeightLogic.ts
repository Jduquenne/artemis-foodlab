import { supportsCookedWeight } from "../../domain/recipePredicates";
import { hasAtMostTwoDecimals } from "./portionsPerPersonLogic";

export const MAX_COOKED_WEIGHT_GRAMS = 100000;

export function validateCookedWeight(value: number | null | undefined, categoryId: string): string[] {
  if (!supportsCookedWeight({ categoryId }) || value === null || value === undefined) return [];
  if (value <= 0) return ["Le poids cuit doit être strictement positif."];
  if (value > MAX_COOKED_WEIGHT_GRAMS) return [`Le poids cuit ne doit pas dépasser ${MAX_COOKED_WEIGHT_GRAMS} g.`];
  if (!hasAtMostTwoDecimals(value)) return ["Le poids cuit ne peut avoir que 2 décimales au maximum."];
  return [];
}

export function cookedWeightToApi(value: number | null | undefined, categoryId: string): number | null {
  if (!supportsCookedWeight({ categoryId })) return null;
  return value ?? null;
}
