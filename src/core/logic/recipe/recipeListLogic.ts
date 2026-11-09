import { OutdoorEntry, RecipeDetails } from "../../domain/recipe";
import { isIngredient } from "../../domain/recipePredicates";
import { includesText, normalizeQuery } from "../../utils/textUtils";

export interface CategoryRecipeEntry {
  id: string;
  name: string;
  recipeUrl: string;
  isIngredientKind: boolean;
}

export function searchOutdoorRecipes(outdoor: Record<string, OutdoorEntry>, query: string, limit?: number): OutdoorEntry[] {
  const q = normalizeQuery(query);
  const results = Object.values(outdoor).filter(e => !q || includesText(e.name, q));
  return limit === undefined ? results : results.slice(0, limit);
}

export interface LinkedBase {
  id: string;
  name: string;
  portions: number;
}

export function basePortionsNeeded(recipe: Pick<RecipeDetails, "ingredients">, baseId: string): number {
  const total = recipe.ingredients
    .filter((ing) => ing.baseId === baseId)
    .reduce((sum, ing) => sum + (ing.quantity ?? 0), 0);
  return Math.max(1, Math.round(total));
}

export function getLinkedBases(
  recipes: Record<string, RecipeDetails>,
  recipe: Pick<RecipeDetails, "ingredients">,
): LinkedBase[] {
  const seen = new Set<string>();
  const result: LinkedBase[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.baseId && !seen.has(ing.baseId)) {
      seen.add(ing.baseId);
      const base = recipes[ing.baseId];
      if (base?.assets?.mealPhoto) {
        result.push({ id: ing.baseId, name: base.name, portions: basePortionsNeeded(recipe, ing.baseId) });
      }
    }
  }
  return result;
}

export function getCategoryRecipeIds(recipes: Record<string, RecipeDetails>, categoryId: string): string[] {
  return Object.entries(recipes)
    .filter(([, r]) => r.categoryId === categoryId && (r.assets?.mealPhoto || r.assets?.instructionsPhoto))
    .map(([id]) => id);
}

export function getCategoryRecipes(recipes: Record<string, RecipeDetails>, categoryId: string): CategoryRecipeEntry[] {
  return Object.entries(recipes)
    .filter(([, recipe]) => recipe.categoryId === categoryId && (recipe.assets?.mealPhoto || isIngredient(recipe)))
    .map(([recipeId, recipe]) => {
      const hasInstructions = !!recipe.instructions;
      return {
        id: recipeId,
        name: recipe.name,
        recipeUrl: hasInstructions
          ? (isIngredient(recipe) ? recipeId : (recipe.assets.mealPhoto?.url ?? recipe.assets.instructionsPhoto?.url ?? ""))
          : "",
        isIngredientKind: isIngredient(recipe),
      };
    });
}

export const resolveRestoredCount = (
  saved: number | undefined,
  batchSize: number,
  total: number,
): number => Math.min(Math.max(saved ?? 0, batchSize), Math.max(total, batchSize));
