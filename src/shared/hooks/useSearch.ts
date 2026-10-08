import { useMemo } from "react";
import { RecipeKind } from "../../core/domain/recipe";
import { isDessert } from "../../core/domain/recipePredicates";
import { MAX_PICKER_RESULTS, SearchRecipeResult, searchRecipes } from "../../core/logic/recipe/recipeSearchLogic";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";

export const useSearchRecipes = (
  query: string | null,
): SearchRecipeResult[] => {
  const recipes = useRecipesSnapshot();
  return useMemo(() => searchRecipes(recipes, query), [recipes, query]);
};

export const useSearchMeals = (query: string | null): SearchRecipeResult[] => {
  const recipes = useRecipesSnapshot();
  return useMemo(
    () => searchRecipes(recipes, query, [RecipeKind.DISH, RecipeKind.INGREDIENT], undefined, MAX_PICKER_RESULTS),
    [recipes, query],
  );
};

export const useSearchIngredients = (query: string | null): SearchRecipeResult[] => {
  const recipes = useRecipesSnapshot();
  return useMemo(() => searchRecipes(recipes, query, [RecipeKind.INGREDIENT]), [recipes, query]);
};

export const useSearchDesserts = (query: string | null): SearchRecipeResult[] => {
  const recipes = useRecipesSnapshot();
  return useMemo(
    () => searchRecipes(recipes, query, undefined, isDessert, MAX_PICKER_RESULTS),
    [recipes, query],
  );
};
