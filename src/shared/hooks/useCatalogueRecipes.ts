import { useCallback, useState } from "react";
import { RecipeDetails } from "../../core/domain/types";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { deleteRecipe } from "../../core/services/catalogueWriteService";
import { removeRecipeFromCatalogue } from "../../core/services/catalogueSyncService";
import { sortRecipes } from "../../core/logic/dashboard/recipeTableLogic";
import { useNewsStore } from "../store/useNewsStore";

export interface UseCatalogueRecipesResult {
  recipes: RecipeDetails[];
  remove: (code: string) => Promise<boolean>;
}

function snapshot(): RecipeDetails[] {
  return sortRecipes(Object.values(typedRecipesDb));
}

export function useCatalogueRecipes(): UseCatalogueRecipesResult {
  const [recipes, setRecipes] = useState<RecipeDetails[]>(snapshot);

  const remove = useCallback(async (code: string) => {
    const target = typedRecipesDb[code];
    if (!target?.apiId) return false;
    try {
      await deleteRecipe(target.apiId);
      await removeRecipeFromCatalogue(code);
      useNewsStore.getState().syncHasNew();
      setRecipes(snapshot());
      return true;
    } catch {
      return false;
    }
  }, []);

  return { recipes, remove };
}
