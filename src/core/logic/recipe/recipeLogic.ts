import { Food, RecipeDetails, Unit } from "../../domain/types";
import { isIngredient } from "../../domain/recipePredicates";
import { typedRecipesDb } from "../../typed-db/typedRecipesDb";
import { typedFoodDb } from "../../typed-db/typedFoodDb";
import { OutdoorEntry, typedOutdoorDb } from "../../typed-db/typedOutdoorDb";
import { PREDEFINED_FILTERS } from "../../domain/predefinedFilters";
import { calculateRecipeMacros } from "../../../shared/utils/macroUtils";
import { typedInstructionsDb } from "../../typed-db/typedInstructionsDb";

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

export function searchOutdoorRecipes(query: string): OutdoorEntry[] {
  const q = query.toLowerCase();
  return Object.values(typedOutdoorDb).filter(e => !q || e.name.toLowerCase().includes(q));
}

export function getLinkedBases(
  recipe: Pick<RecipeDetails, "ingredients">,
): { id: string; name: string }[] {
  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.baseId && !seen.has(ing.baseId)) {
      seen.add(ing.baseId);
      const base = typedRecipesDb[ing.baseId];
      if (base?.assets?.mealPhoto) {
        result.push({ id: ing.baseId, name: base.name });
      }
    }
  }
  return result;
}

export function getCategoryRecipeIds(categoryId: string): string[] {
  return Object.entries(typedRecipesDb)
    .filter(([, r]) => r.categoryId === categoryId && (r.assets?.mealPhoto || r.assets?.instructionsPhoto))
    .map(([id]) => id);
}

export function getCategoryRecipes(categoryId: string): CategoryRecipeEntry[] {
  return Object.entries(typedRecipesDb)
    .filter(([, recipe]) => recipe.categoryId === categoryId && (recipe.assets?.mealPhoto || isIngredient(recipe)))
    .map(([recipeId, recipe]) => {
      const hasInstructions = !!typedInstructionsDb[recipeId];
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
  items: T[],
  activeFilterIds: string[],
): T[] {
  if (activeFilterIds.length === 0) return items;
  const activeFilters = PREDEFINED_FILTERS.filter(f => activeFilterIds.includes(f.id));
  return items.filter(item => {
    const id = item.recipeId ?? item.id;
    const details = typedRecipesDb[id];
    if (!details) return false;
    const macros = calculateRecipeMacros(details, typedRecipesDb, typedFoodDb);
    return activeFilters.every(f => f.check(macros));
  });
}

export function filterCategoryRecipesByMacros(
  recipes: CategoryRecipeEntry[],
  activeFilterIds: string[],
): CategoryRecipeEntry[] {
  if (activeFilterIds.length === 0) return recipes;
  const activeFilters = PREDEFINED_FILTERS.filter(f => activeFilterIds.includes(f.id));
  return recipes.filter(recipe => {
    const macros = typedRecipesDb[recipe.id]?.macronutriment;
    if (!macros) return false;
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

export function buildUnitWeightOverrides(recipe: RecipeDetails): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ing of recipe.ingredients) {
    if (ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit)) {
      const w = typedFoodDb[ing.foodId]?.unitWeight;
      if (w != null) map[ing.foodId] = w;
    }
  }
  return map;
}

export function applyUnitWeightOverrides(unitWeights: Record<string, number>): Record<string, Food> {
  const result = { ...typedFoodDb };
  for (const [foodId, weight] of Object.entries(unitWeights)) {
    if (result[foodId]) result[foodId] = { ...result[foodId], unitWeight: weight };
  }
  return result;
}
