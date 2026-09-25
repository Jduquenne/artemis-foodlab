import { Food } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { isBatchCookable } from "../../domain/recipePredicates";
import { compareByName } from "../../../shared/utils/sortUtils";
import { includesText, normalizeQuery, rankByQuery } from "../../../shared/utils/textUtils";

export interface BatchRecipeResult {
  id: string;
  name: string;
  isBatch: boolean;
}

export function searchBatchRecipes(recipes: Record<string, RecipeDetails>, query: string): BatchRecipeResult[] {
  const q = normalizeQuery(query);
  return Object.entries(recipes)
    .filter(([, r]) => r.assets?.mealPhoto && (!q || includesText(r.name, q)))
    .sort(([, a], [, b]) => {
      const aBatch = isBatchCookable(a);
      const bBatch = isBatchCookable(b);
      if (aBatch && !bBatch) return -1;
      if (!aBatch && bBatch) return 1;
      return compareByName(a, b);
    })
    .slice(0, 30)
    .map(([id, r]) => ({ id, name: r.name, isBatch: isBatchCookable(r) }));
}

export function searchFreezerFoods(foods: Record<string, Food>, query: string): Food[] {
  const q = normalizeQuery(query);
  if (!q) return [];
  return rankByQuery(Object.values(foods).sort(compareByName), q, (food) => food.name).slice(0, 8);
}
