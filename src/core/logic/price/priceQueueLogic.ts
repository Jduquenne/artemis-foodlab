import { Food, Unit } from "../../domain/ingredient";
import { FoodPrice } from "../../domain/price";
import { RecipeDetails } from "../../domain/recipe";
import { isIngredient } from "../../domain/recipePredicates";
import { compareText } from "../../utils/sortUtils";

export type PriceQueueScope = "missing" | "all";

export const PRICE_QUEUE_SCOPES: { id: PriceQueueScope; label: string }[] = [
  { id: "missing", label: "Sans prix" },
  { id: "all", label: "Tous" },
];

export function buildPriceQueue(foods: readonly Food[], prices: Map<string, FoodPrice>, scope: PriceQueueScope): string[] {
  return foods
    .filter((food) => scope === "all" || !prices.has(food.id))
    .sort((a, b) => compareText(a.category, b.category) || compareText(a.name, b.name))
    .map((food) => food.id);
}

export function ingredientRecipesByFood(recipes: Record<string, RecipeDetails>): Map<string, RecipeDetails> {
  const byFood = new Map<string, RecipeDetails>();
  for (const recipe of Object.values(recipes)) {
    const foodId = isIngredient(recipe) ? recipe.ingredients[0]?.foodId : undefined;
    if (foodId && !byFood.has(foodId)) byFood.set(foodId, recipe);
  }
  return byFood;
}

export function isLiquidFood(food: Pick<Food, "unit">): boolean {
  return food.unit === Unit.ML;
}
