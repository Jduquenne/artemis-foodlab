import { Food } from "../../domain/ingredient";
import { OutdoorEntry, RecipeDetails } from "../../domain/recipe";
import { isIngredient } from "../../domain/recipePredicates";
import { calculateRecipeMacros } from "../../../shared/utils/macroUtils";
import { PREDEFINED_FILTERS } from "./predefinedFilterLogic";

export interface CategoryRecipeEntry {
  id: string;
  name: string;
  recipeUrl: string;
  isIngredientKind: boolean;
}

export function searchOutdoorRecipes(outdoor: Record<string, OutdoorEntry>, query: string): OutdoorEntry[] {
  const q = query.toLowerCase();
  return Object.values(outdoor).filter(e => !q || e.name.toLowerCase().includes(q));
}

export function getLinkedBases(
  recipes: Record<string, RecipeDetails>,
  recipe: Pick<RecipeDetails, "ingredients">,
): { id: string; name: string }[] {
  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.baseId && !seen.has(ing.baseId)) {
      seen.add(ing.baseId);
      const base = recipes[ing.baseId];
      if (base?.assets?.mealPhoto) {
        result.push({ id: ing.baseId, name: base.name });
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

export function filterRecipesByMacros<T extends { recipeId?: string; id: string }>(
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  items: T[],
  activeFilterIds: string[],
): T[] {
  if (activeFilterIds.length === 0) return items;
  const activeFilters = PREDEFINED_FILTERS.filter(f => activeFilterIds.includes(f.id));
  return items.filter(item => {
    const id = item.recipeId ?? item.id;
    const details = recipes[id];
    if (!details) return false;
    const macros = calculateRecipeMacros(details, recipes, foods);
    return activeFilters.every(f => f.check(macros));
  });
}

export const resolveRestoredCount = (
  saved: number | undefined,
  batchSize: number,
  total: number,
): number => Math.min(Math.max(saved ?? 0, batchSize), Math.max(total, batchSize));
