import { Ingredient, RecipeDetails, Unit } from "../../domain/types";

export function isOverridableIngredient(ingredient: Ingredient): boolean {
  return ingredient.quantity != null && ingredient.unit !== Unit.NONE;
}

export function scaleIngredientsByRatio(recipe: RecipeDetails, ratio: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const ingredient of recipe.ingredients) {
    if (ingredient.quantity == null || ingredient.unit === Unit.NONE) continue;
    result[ingredient.id] = Math.round(ingredient.quantity * ratio * 100) / 100;
  }
  return result;
}

export function defaultIngredientOverridesForPortions(
  recipe: RecipeDetails | undefined,
  portions: number,
): Record<string, number> {
  if (!recipe || recipe.defaultPortions <= 0) return {};
  return scaleIngredientsByRatio(recipe, portions / recipe.defaultPortions);
}

export function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) return record;
  return Object.fromEntries(Object.entries(record).filter(([k]) => k !== key));
}
