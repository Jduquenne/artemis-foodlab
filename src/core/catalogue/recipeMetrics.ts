import { Food } from "../domain/ingredient";
import { Macronutrients } from "../domain/nutrition";
import { RecipeDetails } from "../domain/recipe";
import { calculateRecipeBaseGrams, calculateRecipeMacros } from "../logic/nutrition/macroLogic";
import { recipesCatalogue } from "./recipes";
import { foodsCatalogue } from "./foods";

export const RECIPE_MACROS: Record<string, Macronutrients> = {};
export const RECIPE_BASE_GRAMS: Record<string, number> = {};

export function refreshRecipeMacros(
  allRecipes: Record<string, RecipeDetails>,
  foodDb: Record<string, Food>,
): void {
  for (const key of Object.keys(RECIPE_MACROS)) delete RECIPE_MACROS[key];
  for (const key of Object.keys(RECIPE_BASE_GRAMS)) delete RECIPE_BASE_GRAMS[key];

  for (const [id, recipe] of Object.entries(allRecipes)) {
    try {
      RECIPE_MACROS[id] = calculateRecipeMacros(recipe, allRecipes, foodDb);
    } catch {
      delete RECIPE_MACROS[id];
    }
    const grams = calculateRecipeBaseGrams(recipe, foodDb);
    if (grams > 0) RECIPE_BASE_GRAMS[id] = grams;
  }
}

refreshRecipeMacros(recipesCatalogue, foodsCatalogue);
