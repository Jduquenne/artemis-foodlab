import { FILTER_TYPE_DEFINITIONS, RecipeFilterType } from "../../domain/recipeFilter";
import { RecipeDetails } from "../../domain/recipe";
import { isDish } from "../../domain/recipePredicates";

export function matchesFilterType(recipe: RecipeDetails, type: RecipeFilterType): boolean {
  const definition = FILTER_TYPE_DEFINITIONS.find((entry) => entry.type === type);
  if (!definition || !isDish(recipe)) return false;
  if (definition.categoryIds) return definition.categoryIds.includes(recipe.categoryId);
  return !(definition.excludedCategoryIds ?? []).includes(recipe.categoryId);
}

export function getFilterTypeLabel(type: RecipeFilterType): string {
  return FILTER_TYPE_DEFINITIONS.find((entry) => entry.type === type)?.label ?? "";
}
