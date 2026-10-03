import { FILTER_TYPE_DEFINITIONS, FilterMacroKey, RecipeFilterType } from "../../domain/recipeFilter";
import { MACRO_DISPLAYS, Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { matchesFilterType } from "./recipeFilterTypeLogic";

export type MacroMedians = Partial<Record<FilterMacroKey, number>>;
export type TypeMedians = Record<RecipeFilterType, MacroMedians>;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function computeMedians(
  recipes: Record<string, RecipeDetails>,
  recipeMacros: Record<string, Macronutrients>,
  type: RecipeFilterType,
): MacroMedians {
  const references = Object.entries(recipes)
    .filter(([id, recipe]) => id in recipeMacros && matchesFilterType(recipe, type))
    .map(([id]) => recipeMacros[id]);
  const medians: MacroMedians = {};
  for (const { key } of MACRO_DISPLAYS) {
    const value = median(references.map((macros) => macros[key]));
    if (value !== null) medians[key] = Math.round(value);
  }
  return medians;
}

export function computeTypeMedians(
  recipes: Record<string, RecipeDetails>,
  recipeMacros: Record<string, Macronutrients>,
): TypeMedians {
  const result = {} as TypeMedians;
  for (const { type } of FILTER_TYPE_DEFINITIONS) result[type] = computeMedians(recipes, recipeMacros, type);
  return result;
}
