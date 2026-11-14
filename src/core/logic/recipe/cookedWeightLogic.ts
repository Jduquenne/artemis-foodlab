export function cookedWeightPerPortion(
  recipe: { cookedWeightGrams?: number; defaultPortions?: number } | undefined,
): number | null {
  if (!recipe?.cookedWeightGrams || !recipe.defaultPortions) return null;
  return recipe.cookedWeightGrams / recipe.defaultPortions;
}
