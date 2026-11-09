import { Food } from "../../domain/ingredient";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { recipeFoodIds } from "../menuGenerator/preferredFoodLogic";

export const RECIPE_FOOD_PARAM = "food";

export function recipesUsingFood(
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  foodId: string,
): Set<string> {
  const catalogue = { recipes, foods };
  const ids = new Set<string>();
  for (const [recipeId, recipe] of Object.entries(recipes)) {
    if (recipe.kind === RecipeKind.DISH && recipeFoodIds(recipe, catalogue).has(foodId)) ids.add(recipeId);
  }
  return ids;
}

export function recipeFoodPath(foodId: string): string {
  return `/recipes?${RECIPE_FOOD_PARAM}=${encodeURIComponent(foodId)}`;
}
