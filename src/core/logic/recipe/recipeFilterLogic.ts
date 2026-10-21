import {
  EMPTY_RECIPE_FILTER,
  FilterCandidate,
  FilterMacroKey,
  MacroComparison,
  RecipeFilter,
  RecipeFilterType,
} from "../../domain/recipeFilter";
import { MACRO_DISPLAYS, MacroDisplay, Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { TypeMedians } from "./macroReferenceLogic";
import { candidateRecipeId, matchesFilterType } from "./recipeFilterTypeLogic";

export function normalizeRecipeFilter(raw: Partial<RecipeFilter> | null): RecipeFilter {
  const inSeason = raw?.inSeason === true;
  const type = Object.values(RecipeFilterType).find((value) => value === raw?.type) ?? null;
  if (type === null) return { ...EMPTY_RECIPE_FILTER, inSeason };
  const macros: RecipeFilter["macros"] = {};
  for (const { key } of MACRO_DISPLAYS) {
    const comparison = raw?.macros?.[key];
    if (comparison === "below" || comparison === "above") macros[key] = comparison;
  }
  return { type, macros, inSeason };
}

export function isRecipeFilterActive(filter: RecipeFilter): boolean {
  return filter.type !== null || filter.inSeason;
}

export function countFilterCriteria(filter: RecipeFilter): number {
  const seasonCount = filter.inSeason ? 1 : 0;
  if (filter.type === null) return seasonCount;
  return seasonCount + 1 + Object.keys(filter.macros).length;
}

export function setFilterType(filter: RecipeFilter, type: RecipeFilterType | null): RecipeFilter {
  if (type === null) return { ...EMPTY_RECIPE_FILTER, inSeason: filter.inSeason };
  return { ...filter, type };
}

export function setFilterInSeason(filter: RecipeFilter, inSeason: boolean): RecipeFilter {
  return { ...filter, inSeason };
}

export function setFilterMacro(
  filter: RecipeFilter,
  key: FilterMacroKey,
  comparison: MacroComparison | null,
): RecipeFilter {
  const macros = { ...filter.macros };
  if (comparison === null) delete macros[key];
  else macros[key] = comparison;
  return { ...filter, macros };
}

export function matchesRecipeFilter(
  recipe: RecipeDetails,
  macros: Macronutrients | undefined,
  filter: RecipeFilter,
  medians: TypeMedians,
  inSeason: boolean,
): boolean {
  if (filter.inSeason && !inSeason) return false;
  const { type } = filter;
  if (type === null) return true;
  if (!matchesFilterType(recipe, type)) return false;
  const criteria = MACRO_DISPLAYS.filter(({ key }) => filter.macros[key] !== undefined);
  if (criteria.length === 0) return true;
  if (!macros) return false;
  return criteria.every(({ key }) => {
    const threshold = medians[type][key];
    if (threshold === undefined) return true;
    return filter.macros[key] === "below" ? macros[key] < threshold : macros[key] > threshold;
  });
}

export function filterRecipesByFilter<T extends FilterCandidate>(
  items: T[],
  recipes: Record<string, RecipeDetails>,
  recipeMacros: Record<string, Macronutrients>,
  filter: RecipeFilter,
  medians: TypeMedians,
  inSeasonIds: ReadonlySet<string>,
): T[] {
  if (!isRecipeFilterActive(filter)) return items;
  return items.filter((item) => {
    const id = candidateRecipeId(item);
    const recipe = recipes[id];
    return recipe !== undefined && matchesRecipeFilter(recipe, recipeMacros[id], filter, medians, inSeasonIds.has(id));
  });
}

export function formatMacroValue(display: MacroDisplay, value: number): string {
  return `${value} ${display.unit || "kcal"}`;
}

export function formatMacroCriterion(display: MacroDisplay, comparison: MacroComparison, threshold: number | undefined): string {
  const symbol = comparison === "below" ? "<" : ">";
  if (threshold === undefined) return `${display.label} ${symbol} médiane`;
  return `${display.label} ${symbol} ${threshold}${display.unit ? ` ${display.unit}` : ""}`;
}
