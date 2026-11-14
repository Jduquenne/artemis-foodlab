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
