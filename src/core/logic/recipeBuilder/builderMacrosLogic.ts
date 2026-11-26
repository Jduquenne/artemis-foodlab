import { Food } from "../../domain/ingredient";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { DraftIngredient } from "../../domain/recipeBuilderTypes";
import { ZERO, addMacros, calculateRecipeMacros, floorMacrosAtZero, scaleMacros, toGrams } from "../nutrition/macroLogic";
import { basePortionsOf } from "../recipe/cookedWeightLogic";

export function computeDraftTotal(
  foods: Record<string, Food>,
  recipes: Record<string, RecipeDetails>,
  ingredients: DraftIngredient[],
): {
  macros: Macronutrients;
  missing: number;
} {
  let total = { ...ZERO };
  let missing = 0;

  for (const ing of ingredients) {
    if (ing.quantity === null || ing.quantity === 0) continue;

    if (ing.ingredientType === "food" && ing.foodId) {
      const food = foods[ing.foodId];
      if (!food) {
        missing++;
        continue;
      }
      const grams = toGrams(ing.quantity, ing.unit, food.unitWeight);
      if (grams === null) {
        missing++;
        continue;
      }
      total = addMacros(total, scaleMacros(food.macros, (ing.removed ? -grams : grams) / 100));
    } else if (ing.ingredientType === "base" && ing.baseId) {
      const base = recipes[ing.baseId];
      if (!base) {
        missing++;
        continue;
      }
      const basePortions = basePortionsOf(ing.quantity, ing.unit, base);
      if (basePortions === null) {
        missing++;
        continue;
      }
      const basePerPortion = calculateRecipeMacros(base, recipes, foods);
      total = addMacros(total, scaleMacros(basePerPortion, basePortions));
    } else {
      missing++;
    }
  }

  return { macros: floorMacrosAtZero(total), missing };
}
