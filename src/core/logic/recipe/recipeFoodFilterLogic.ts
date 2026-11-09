import { Food } from "../../domain/ingredient";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { FilterCandidate } from "../../domain/recipeFilter";
import { createFoodIndex, recipeFoodIds } from "../menuGenerator/preferredFoodLogic";
import { candidateRecipeId } from "./recipeFilterTypeLogic";

export const RECIPE_FOOD_PARAM = "food";

export function recipesUsingFood(
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  foodId: string,
): Set<string> {
  const catalogue = { recipes, foods };
  const ids = new Set<string>();
  for (const [recipeId, recipe] of Object.entries(recipes)) {
    if (recipe.kind === RecipeKind.DISH && recipeFoodIds(recipe, catalogue).has(foodId)) ids.add(recipeId);
  }
  return ids;
}

export function recipeFoodPath(foodId: string): string {
  return `/recipes?${RECIPE_FOOD_PARAM}=${encodeURIComponent(foodId)}`;
}

export type FamilyRecipeIndex = ReadonlyMap<string, ReadonlySet<string>>;

export function familyRecipeIndex(recipes: Record<string, RecipeDetails>, foods: Record<string, Food>): FamilyRecipeIndex {
  const foodIdsOf = createFoodIndex({ recipes, foods });
  const index = new Map<string, Set<string>>();
  for (const [recipeId, recipe] of Object.entries(recipes)) {
    if (recipe.kind !== RecipeKind.DISH) continue;
    for (const foodId of foodIdsOf(recipe.code)) {
      const groupId = foods[foodId]?.groupId;
      if (!groupId) continue;
      const ids = index.get(groupId) ?? new Set<string>();
      ids.add(recipeId);
      index.set(groupId, ids);
    }
  }
  return index;
}

export function countByFamily(candidates: readonly FilterCandidate[], index: FamilyRecipeIndex): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [groupId, ids] of index) {
    counts.set(groupId, candidates.filter((candidate) => ids.has(candidateRecipeId(candidate))).length);
  }
  return counts;
}
