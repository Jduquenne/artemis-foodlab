import { useMemo } from "react";
import recipesDb from "../../core/data/recipes-db.json";
import { RecipeDetails, RecipeKind } from "../../core/domain/types";

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
    .filter((ing) => ing.name.toLowerCase().includes(query))
    .map((ing) => ing.name);
}

function matchesQuery(
  recipeId: string,
  recipe: RecipeDetails,
  query: string,
): boolean {
  const isNumeric = /^\d+$/.test(query);
  const nameMatch = recipe.name.toLowerCase().includes(query);
  const idMatch = matchesRecipeId(recipeId, query);

  if (isNumeric) return nameMatch || idMatch;

  const ingredientMatch = recipe.ingredients.some((ing) =>
    ing.name.toLowerCase().includes(query),
  );
  return nameMatch || idMatch || ingredientMatch;
}

function toResult(
  recipeId: string,
  recipe: RecipeDetails,
  query: string,
): SearchRecipeResult {
  const isNumeric = /^\d+$/.test(query);
  return {
    id: recipeId,
    recipeId,
    name: recipe.name,
    photoUrl: recipe.assets.photo!.url,
    ingredientsUrl: recipe.assets.ingredientsPhoto?.url ?? "",
    recipeUrl: recipe.assets.instructionsPhoto?.url,
    matchedIngredients: isNumeric ? [] : getMatchedIngredients(recipe, query),
  };
}

function closestWordDistance(text: string, query: string): number {
  let min = Infinity;
  for (const word of text.toLowerCase().split(/[\s,\-']+/)) {
    if (word.includes(query)) min = Math.min(min, word.length - query.length);
  }
  return min;
}

function search(
  query: string | null,
  kinds?: RecipeKind[],
): SearchRecipeResult[] {
  if (query === null) return [];
  const normalizedQuery = query.toLowerCase().trim();

  const results = Object.entries(db)
    .filter(([, recipe]) => Boolean(recipe.assets?.photo))
    .filter(([, recipe]) => !kinds || kinds.includes(recipe.kind))
    .filter(
      ([recipeId, recipe]) =>
        !normalizedQuery || matchesQuery(recipeId, recipe, normalizedQuery),
    )
    .map(([recipeId, recipe]) => toResult(recipeId, recipe, normalizedQuery));

  if (!normalizedQuery || /^\d+$/.test(normalizedQuery)) return results;

  const nameOrId = results
    .filter(
      (r) =>
        r.name.toLowerCase().includes(normalizedQuery) ||
        matchesRecipeId(r.recipeId, normalizedQuery),
    )
    .sort((a, b) => closestWordDistance(a.name, normalizedQuery) - closestWordDistance(b.name, normalizedQuery));

  const ingredientOnly = results
    .filter(
      (r) =>
        !r.name.toLowerCase().includes(normalizedQuery) &&
        !matchesRecipeId(r.recipeId, normalizedQuery),
    )
    .sort((a, b) => {
      const aScore = Math.min(...a.matchedIngredients.map(i => closestWordDistance(i, normalizedQuery)));
      const bScore = Math.min(...b.matchedIngredients.map(i => closestWordDistance(i, normalizedQuery)));
      return aScore - bScore;
    });

  return [...nameOrId, ...ingredientOnly];
}

export const useSearchRecipes = (
  query: string | null,
): SearchRecipeResult[] => {
  return useMemo(() => search(query), [query]);
};

export const useSearchMeals = (query: string | null): SearchRecipeResult[] => {
  return useMemo(
    () => search(query, [RecipeKind.DISH, RecipeKind.INGREDIENT]),
    [query],
  );
};
