import { useCallback, useMemo } from "react";
import { RecipeDetails } from "../../core/domain/recipe";
import { deleteRecipe } from "../../core/services/catalogueWriteService";
import { removeRecipeFromCatalogue } from "../../core/services/catalogueSyncService";
import { sortRecipes } from "../../core/logic/dashboard/recipeTableLogic";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";

export interface UseCatalogueRecipesResult {
  recipes: RecipeDetails[];
  remove: (code: string) => Promise<boolean>;
}

export function useCatalogueRecipes(): UseCatalogueRecipesResult {
  const recipesDb = useRecipesSnapshot();
  const recipes = useMemo(() => sortRecipes(Object.values(recipesDb)), [recipesDb]);

  const remove = useCallback(async (code: string) => {
    const target = recipesDb[code];
    if (!target?.apiId) return false;
    try {
      await deleteRecipe(target.apiId);
      await removeRecipeFromCatalogue(code);
      return true;
    } catch {
      return false;
    }
  }, [recipesDb]);

  return { recipes, remove };
}
