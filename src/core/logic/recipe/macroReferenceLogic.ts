import { MACRO_REFERENCE_EXCLUDED_CATEGORY_IDS } from "../../domain/predefinedFilters";
import { Macronutrients, NUTRIENT_DEFINITIONS } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { isDish } from "../../domain/recipePredicates";

export type MacroMedians = Partial<Record<keyof Macronutrients, number>>;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function isMacroReferenceRecipe(recipe: RecipeDetails): boolean {
  return isDish(recipe) && !MACRO_REFERENCE_EXCLUDED_CATEGORY_IDS.includes(recipe.categoryId);
}

export function computeMacroMedians(
  recipes: Record<string, RecipeDetails>,
  recipeMacros: Record<string, Macronutrients>,
): MacroMedians {
  const references = Object.entries(recipes)
    .filter(([id, recipe]) => isMacroReferenceRecipe(recipe) && id in recipeMacros)
    .map(([id]) => recipeMacros[id]);
  const medians: MacroMedians = {};
  for (const { key } of NUTRIENT_DEFINITIONS) {
    const value = median(references.map((macros) => macros[key]));
    if (value !== null) medians[key] = Math.round(value);
  }
  return medians;
}
