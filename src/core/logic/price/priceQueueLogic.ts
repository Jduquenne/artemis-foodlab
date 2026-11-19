import { Food, Unit } from "../../domain/ingredient";
import { FoodPrice } from "../../domain/price";
import { RecipeDetails } from "../../domain/recipe";
import { isIngredient } from "../../domain/recipePredicates";
import { subMonths } from "date-fns";
import { compareText } from "../../utils/sortUtils";
import { includesText, normalizeQuery } from "../../utils/textUtils";

export type PriceQueueScope = "missing" | "stale" | "all";

export const PRICE_QUEUE_SCOPES: { id: PriceQueueScope; label: string }[] = [
  { id: "missing", label: "Sans prix" },
  { id: "stale", label: "Anciens" },
  { id: "all", label: "Tous" },
];

export const PRICE_STALE_MONTHS = 6;

export interface PriceQueueFilters {
  scope: PriceQueueScope;
  category: string | null;
  query: string;
}

export function isStalePrice(price: FoodPrice, now: Date): boolean {
  return new Date(price.recordedAt) < subMonths(now, PRICE_STALE_MONTHS);
}

function matchesScope(price: FoodPrice | undefined, scope: PriceQueueScope, now: Date): boolean {
  if (scope === "missing") return !price;
  if (scope === "stale") return !!price && isStalePrice(price, now);
  return true;
}

export function buildPriceQueue(
  foods: readonly Food[],
  prices: Map<string, FoodPrice>,
  filters: PriceQueueFilters,
  now: Date,
): string[] {
  const needle = normalizeQuery(filters.query);
  return foods
    .filter((food) => matchesScope(prices.get(food.id), filters.scope, now))
    .filter((food) => !filters.category || food.category === filters.category)
    .filter((food) => !needle || includesText(food.name, needle))
    .sort((a, b) => compareText(a.category, b.category) || compareText(a.name, b.name))
    .map((food) => food.id);
}

export function priceQueueCategories(foods: readonly Food[]): string[] {
  return [...new Set(foods.map((food) => food.category))].sort(compareText);
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
