import { Food } from "../../domain/ingredient";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { DraftIngredient } from "../../domain/recipeBuilderTypes";
import { ZERO, addMacros, calculateRecipeMacros, scaleMacros, toGrams } from "../../../shared/utils/macroUtils";

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
    if (ing.quantity == null || ing.quantity === 0) continue;

    if (ing.foodId) {
      const food = foods[ing.foodId];
      if (!food) {
        missing++;
        continue;
      }
      const grams = toGrams(ing.quantity, ing.unit, food.unitWeight);
      if (grams == null) {
        missing++;
        continue;
      }
      total = addMacros(total, scaleMacros(food.macros, grams / 100));
    } else if (ing.baseId) {
      const base = recipes[ing.baseId];
      if (!base) {
        missing++;
        continue;
      }
      const basePerPortion = calculateRecipeMacros(base, recipes, foods);
      total = addMacros(total, scaleMacros(basePerPortion, ing.quantity));
    } else {
      missing++;
    }
  }

  return { macros: total, missing };
}
