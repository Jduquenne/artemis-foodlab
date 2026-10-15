import { FoodChoice, FoodGroupDefault, ResolvedFood } from "../../domain/foodGroup";
import { Ingredient } from "../../domain/ingredient";

export function resolveIngredientFood(
  ingredient: Ingredient,
  profileId: string,
  profileDefaults: readonly FoodGroupDefault[],
  mealChoices: readonly FoodChoice[],
): ResolvedFood | null {
  if (!ingredient.foodId) return null;
  if (!ingredient.foodGroupId) return { foodId: ingredient.foodId, source: "recipe" };

  const choice = mealChoices.find((c) => c.recipeIngredientId === ingredient.id && c.profileId === profileId);
  if (choice) return { foodId: choice.foodId, source: "meal" };

  const profileDefault = profileDefaults.find((d) => d.foodGroupId === ingredient.foodGroupId);
  if (profileDefault) return { foodId: profileDefault.foodId, source: "profile" };

  return { foodId: ingredient.foodId, source: "recipe" };
}
