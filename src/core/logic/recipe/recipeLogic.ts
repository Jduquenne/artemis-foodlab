import { Food, Unit } from "../../domain/ingredient";
import { OutdoorEntry, RecipeDetails } from "../../domain/recipe";
import { isIngredient } from "../../domain/recipePredicates";
import { PREDEFINED_FILTERS } from "./predefinedFilterLogic";
import { calculateRecipeMacros } from "../../../shared/utils/macroUtils";
import { roundTo } from "../../../shared/utils/numberUtils";

export const UNIT_WEIGHT_UNITS: string[] = [
  Unit.PIECE,
  Unit.PORTION,
  Unit.TRANCHE,
  Unit.FEUILLE,
  Unit.SACHET,
];

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

export function patchRecipeQuantities(recipe: RecipeDetails, quantities: Record<string, number>): RecipeDetails {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: quantities[ing.id] ?? ing.quantity,
    })),
  };
}

export function resolveInitialPortions(defaultPortions: number, portionsParam: string | null): number {
  const parsed = portionsParam ? parseInt(portionsParam, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultPortions;
}

export function scaleRecipeToPortions(recipe: RecipeDetails, portions: number): RecipeDetails {
  if (portions <= 0 || recipe.defaultPortions <= 0 || portions === recipe.defaultPortions) return recipe;
  const factor = portions / recipe.defaultPortions;
  return {
    ...recipe,
    defaultPortions: portions,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity == null ? null : roundTo(ing.quantity * factor, 2),
    })),
  };
}

export function buildRecipeDetailUrl(recipeId: string, portions: number | undefined): string {
  return portions ? `/recipes/detail/${recipeId}?portions=${portions}` : `/recipes/detail/${recipeId}`;
}

export function buildUnitWeightOverrides(foods: Record<string, Food>, recipe: RecipeDetails): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ing of recipe.ingredients) {
    if (ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit)) {
      const w = foods[ing.foodId]?.unitWeight;
      if (w != null) map[ing.foodId] = w;
    }
  }
  return map;
}

export function applyUnitWeightOverrides(foods: Record<string, Food>, unitWeights: Record<string, number>): Record<string, Food> {
  const result = { ...foods };
  for (const [foodId, weight] of Object.entries(unitWeights)) {
    if (result[foodId]) result[foodId] = { ...result[foodId], unitWeight: weight };
  }
  return result;
}
