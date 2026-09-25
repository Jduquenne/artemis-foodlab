import { Food, UNIT_WEIGHT_UNITS } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { roundTo } from "../../../shared/utils/numberUtils";

export function patchRecipeQuantities(recipe: RecipeDetails, quantities: Record<string, number>): RecipeDetails {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: quantities[ing.id] ?? ing.quantity,
    })),
  };
}

export function resolveInitialPortions(defaultPortions: number, portionsParam: string | null): number {
  const parsed = portionsParam ? parseInt(portionsParam, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultPortions;
}

export function scaleRecipeToPortions(recipe: RecipeDetails, portions: number): RecipeDetails {
  if (portions <= 0 || recipe.defaultPortions <= 0 || portions === recipe.defaultPortions) return recipe;
  const factor = portions / recipe.defaultPortions;
  return {
    ...recipe,
    defaultPortions: portions,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity == null ? null : roundTo(ing.quantity * factor, 2),
    })),
  };
}

export function buildRecipeDetailUrl(recipeId: string, portions: number | undefined): string {
  return portions ? `/recipes/detail/${recipeId}?portions=${portions}` : `/recipes/detail/${recipeId}`;
}

export function buildUnitWeightOverrides(foods: Record<string, Food>, recipe: RecipeDetails): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ing of recipe.ingredients) {
    if (ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit)) {
      const w = foods[ing.foodId]?.unitWeight;
      if (w != null) map[ing.foodId] = w;
    }
  }
  return map;
}

export function applyUnitWeightOverrides(foods: Record<string, Food>, unitWeights: Record<string, number>): Record<string, Food> {
  const result = { ...foods };
  for (const [foodId, weight] of Object.entries(unitWeights)) {
    if (result[foodId]) result[foodId] = { ...result[foodId], unitWeight: weight };
  }
  return result;
}
