import { Food } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { isBatchCookable } from "../../domain/recipePredicates";
import { compareByName } from "../../../shared/utils/sortUtils";

export interface BatchRecipeResult {
  id: string;
  name: string;
  isBatch: boolean;
}

export function searchBatchRecipes(recipes: Record<string, RecipeDetails>, query: string): BatchRecipeResult[] {
  const q = query.toLowerCase().trim();
  return Object.entries(recipes)
    .filter(([, r]) => r.assets?.mealPhoto && (!q || r.name.toLowerCase().includes(q)))
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
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return Object.values(foods)
    .filter(f => f.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return compareByName(a, b);
    })
    .slice(0, 8);
}
