import { FILTER_TYPE_DEFINITIONS, FilterCandidate, RecipeFilterType } from "../../domain/recipeFilter";
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

export function candidateRecipeId(candidate: FilterCandidate): string {
  return candidate.recipeId ?? candidate.id;
}

export function countFilterTypes(
  candidates: FilterCandidate[],
  recipes: Record<string, RecipeDetails>,
): Record<RecipeFilterType, number> {
  const counts = { [RecipeFilterType.DISH]: 0, [RecipeFilterType.BREAKFAST]: 0, [RecipeFilterType.SNACK]: 0 };
  for (const candidate of candidates) {
    const recipe = recipes[candidateRecipeId(candidate)];
    if (!recipe) continue;
    for (const { type } of FILTER_TYPE_DEFINITIONS) {
      if (matchesFilterType(recipe, type)) counts[type] += 1;
    }
  }
  return counts;
}
