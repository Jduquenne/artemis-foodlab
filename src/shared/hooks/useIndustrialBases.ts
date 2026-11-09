import { useMemo } from "react";
import { RecipeDetails } from "../../core/domain/recipe";
import { reachableIndustrialBases } from "../../core/logic/baseVersion/baseVersionLogic";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useIndustrialBases(recipeId: string | undefined): RecipeDetails[] {
  const recipes = useRecipesSnapshot();
  return useMemo(() => {
    const recipe = recipeId ? recipes[recipeId] : undefined;
    return recipe ? reachableIndustrialBases(recipe, recipes) : [];
  }, [recipeId, recipes]);
}
