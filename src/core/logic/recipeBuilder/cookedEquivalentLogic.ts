import { FoodCooking } from "../../domain/cooking";
import { Food } from "../../domain/ingredient";
import { DraftIngredient } from "../../domain/recipeBuilderTypes";
import { CookedEquivalent, cookedEquivalents } from "../cooking/recipeCookingLogic";

export function draftCookedEquivalents(
  ingredients: readonly DraftIngredient[],
  foods: Record<string, Food>,
  cookingsByFood: Map<string, FoodCooking[]>,
): Map<string, CookedEquivalent[]> {
  const byId = new Map<string, CookedEquivalent[]>();
  for (const ing of ingredients) {
    if (ing.ingredientType !== "food" || !ing.foodId) continue;
    const equivalents = cookedEquivalents(ing.quantity, ing.unit, foods[ing.foodId], cookingsByFood.get(ing.foodId) ?? []);
    if (equivalents.length > 0) byId.set(ing.id, equivalents);
  }
  return byId;
}
