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

const db = recipesDb as unknown as Record<string, RecipeDetails>;

function matchesRecipeId(recipeId: string, query: string): boolean {
  const numPart = recipeId.split("-")[1];
  return (
    recipeId === query ||
    numPart === query ||
    (numPart !== undefined && parseInt(numPart, 10).toString() === query)
  );
}

function getMatchedIngredients(recipe: RecipeDetails, query: string): string[] {
  return recipe.ingredients
    .filter(ing => ing.name.toLowerCase().includes(query))
    .map(ing => ing.name);
}

function matchesQuery(recipeId: string, recipe: RecipeDetails, query: string): boolean {
  const isNumeric = /^\d+$/.test(query);
  const nameMatch = recipe.name.toLowerCase().includes(query);
  const idMatch = matchesRecipeId(recipeId, query);

  if (isNumeric) return nameMatch || idMatch;

  const ingredientMatch = recipe.ingredients.some(ing =>
    ing.name.toLowerCase().includes(query)
  );
  return nameMatch || idMatch || ingredientMatch;
}

function toResult(recipeId: string, recipe: RecipeDetails, query: string): SearchRecipeResult {
  const isNumeric = /^\d+$/.test(query);
  return {
    id: recipeId,
    recipeId,
    name: recipe.name,
    photoUrl: recipe.assets.photo!.url,
    ingredientsUrl: recipe.assets.ingredients?.url ?? "",
    recipeUrl: recipe.assets.recipes?.url,
    matchedIngredients: isNumeric ? [] : getMatchedIngredients(recipe, query),
  };
}

export const useSearch = (query: string | null): SearchRecipeResult[] => {
  return useMemo(() => {
    if (query === null) return [];
    const normalizedQuery = query.toLowerCase().trim();

    return Object.entries(db)
      .filter(([, recipe]) => Boolean(recipe.assets?.photo))
      .filter(([recipeId, recipe]) => !normalizedQuery || matchesQuery(recipeId, recipe, normalizedQuery))
      .map(([recipeId, recipe]) => toResult(recipeId, recipe, normalizedQuery));
  }, [query]);
};
