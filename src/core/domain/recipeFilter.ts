import { Macronutrients } from "./nutrition";

export type FilterMacroKey = keyof Macronutrients;
export type MacroComparison = "below" | "above";

export enum RecipeFilterType {
  DISH = "dish",
  BREAKFAST = "breakfast",
  SNACK = "snack",
}

export interface RecipeFilter {
  type: RecipeFilterType | null;
  macros: Partial<Record<FilterMacroKey, MacroComparison>>;
}

export interface FilterCandidate {
  id: string;
  recipeId?: string;
}

export const EMPTY_RECIPE_FILTER: RecipeFilter = { type: null, macros: {} };

export interface FilterTypeDefinition {
  type: RecipeFilterType;
  label: string;
  categoryIds?: readonly string[];
  excludedCategoryIds?: readonly string[];
}

export const FILTER_TYPE_DEFINITIONS: readonly FilterTypeDefinition[] = [
  {
    type: RecipeFilterType.DISH,
    label: "Plats",
    excludedCategoryIds: ["cereal-products", "pastries", "bases"],
  },
  { type: RecipeFilterType.BREAKFAST, label: "Petit déjeuner", categoryIds: ["cereal-products"] },
  { type: RecipeFilterType.SNACK, label: "Goûter", categoryIds: ["pastries"] },
];
