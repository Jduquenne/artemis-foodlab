import { Unit } from "../../domain/ingredient";

type CookedWeightRecipe = { cookedWeightGrams?: number; defaultPortions?: number } | undefined;

export function cookedWeightPerPortion(recipe: CookedWeightRecipe): number | null {
  if (!recipe?.cookedWeightGrams || !recipe.defaultPortions) return null;
  return recipe.cookedWeightGrams / recipe.defaultPortions;
}

export function portionsFromCookedGrams(recipe: CookedWeightRecipe, grams: number): number | null {
  const perPortion = cookedWeightPerPortion(recipe);
  return perPortion === null ? null : grams / perPortion;
}

export function cookedGramsFromPortions(recipe: CookedWeightRecipe, portions: number): number | null {
  const perPortion = cookedWeightPerPortion(recipe);
  return perPortion === null ? null : portions * perPortion;
}

export function basePortionsOf(quantity: number, unit: Unit, base: CookedWeightRecipe): number | null {
  if (unit !== Unit.G) return quantity;
  return portionsFromCookedGrams(base, quantity);
}

export function kcalPer100CookedGrams(recipe: CookedWeightRecipe, kcalPerPortion: number): number | null {
  if (!recipe?.cookedWeightGrams || !recipe.defaultPortions) return null;
  return (kcalPerPortion * recipe.defaultPortions * 100) / recipe.cookedWeightGrams;
}
