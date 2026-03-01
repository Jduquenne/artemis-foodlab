import { useMemo } from "react";
import recipesDb from "../../core/data/recipes-db.json";
import { RecipeDetails } from "../../core/domain/types";

export interface SearchRecipeResult {
  id: string;
  recipeId: string;
  name: string;
  photoUrl: string;
  ingredientsUrl: string;
  recipeUrl?: string;
  matchedIngredients: string[];
}

export const useSearch = (query: string | null): SearchRecipeResult[] => {
  return useMemo(() => {
    if (query === null) return [];
    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const lowerQuery = query.toLowerCase().trim();

    return Object.entries(data)
      .filter(([recipeId, recipe]) => {
        if (!recipe.assets?.photo) return false;
        if (!lowerQuery) return true;
        const matchesName = recipe.name.toLowerCase().includes(lowerQuery);
        const parts = recipeId.split("-");
        const numPart = parts[1];
        const matchesId =
          numPart === lowerQuery ||
          (numPart !== undefined && parseInt(numPart, 10).toString() === lowerQuery) ||
          recipeId.toLowerCase() === lowerQuery;
        const matchesIngredient = recipe.ingredients.some(
          ing => ing.name.toLowerCase().includes(lowerQuery)
        );
        return matchesName || matchesId || matchesIngredient;
      })
      .map(([recipeId, recipe]) => ({
        id: recipeId,
        recipeId,
        name: recipe.name,
        photoUrl: recipe.assets.photo!.url,
        ingredientsUrl: recipe.assets.ingredients?.url ?? "",
        recipeUrl: recipe.assets.recipes?.url,
        matchedIngredients: lowerQuery
          ? recipe.ingredients
              .filter(ing => ing.name.toLowerCase().includes(lowerQuery))
              .map(ing => ing.name)
          : [],
      }));
  }, [query]);
};
