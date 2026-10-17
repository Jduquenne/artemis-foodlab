import { Food, IngredientCategory } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { compareByName } from "../../utils/sortUtils";
import { MONTH_COUNT, hasSeason } from "./seasonLogic";

export interface SeasonCatalogue {
  recipes: Record<string, RecipeDetails>;
  foods: Record<string, Food>;
  seasonExemptFoodIds?: ReadonlySet<string>;
}

function collectSeasonalFoods(
  recipe: RecipeDetails,
  catalogue: SeasonCatalogue,
  visited: Set<string>,
  found: Map<string, Food>,
  exempt: Map<string, Food>,
): void {
  if (visited.has(recipe.code)) return;
  visited.add(recipe.code);
  for (const ingredient of recipe.ingredients) {
    if (ingredient.foodId) {
      const food = catalogue.foods[ingredient.foodId];
      if (!food || !hasSeason(food.months)) continue;
      const frozen = ingredient.category === IngredientCategory.FROZEN || catalogue.seasonExemptFoodIds?.has(food.id);
      (frozen ? exempt : found).set(food.id, food);
    } else if (ingredient.baseId) {
      const base = catalogue.recipes[ingredient.baseId];
      if (base) collectSeasonalFoods(base, catalogue, visited, found, exempt);
    }
  }
}

function seasonalFoodSplit(recipe: RecipeDetails, catalogue: SeasonCatalogue): { seasonal: Food[]; exempt: Food[] } {
  const found = new Map<string, Food>();
  const exempt = new Map<string, Food>();
  collectSeasonalFoods(recipe, catalogue, new Set(), found, exempt);
  for (const id of found.keys()) exempt.delete(id);
  return { seasonal: [...found.values()].sort(compareByName), exempt: [...exempt.values()].sort(compareByName) };
}

export function recipeSeasonalFoods(recipe: RecipeDetails, catalogue: SeasonCatalogue): Food[] {
  return seasonalFoodSplit(recipe, catalogue).seasonal;
}

export function frozenOutOfSeasonFoods(recipe: RecipeDetails, month: number, catalogue: SeasonCatalogue): Food[] {
  return seasonalFoodSplit(recipe, catalogue).exempt.filter((food) => !isFoodInSeason(food, month));
}

export function isFoodInSeason(food: Pick<Food, "months">, month: number): boolean {
  return !hasSeason(food.months) || (food.months ?? []).includes(month);
}

export function outOfSeasonFoods(recipe: RecipeDetails, month: number, catalogue: SeasonCatalogue): Food[] {
  return recipeSeasonalFoods(recipe, catalogue).filter((food) => !isFoodInSeason(food, month));
}

export function isRecipeInSeason(recipe: RecipeDetails, month: number, catalogue: SeasonCatalogue): boolean {
  return outOfSeasonFoods(recipe, month, catalogue).length === 0;
}

export function recipeSeasonMonths(recipe: RecipeDetails, catalogue: SeasonCatalogue): number[] {
  const seasonal = recipeSeasonalFoods(recipe, catalogue);
  return Array.from({ length: MONTH_COUNT }, (_, index) => index + 1)
    .filter((month) => seasonal.every((food) => isFoodInSeason(food, month)));
}
