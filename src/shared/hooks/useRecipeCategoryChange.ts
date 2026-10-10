import { useCallback } from "react";
import { CategoryChangeTarget } from "../../core/logic/recipeBuilder/recipeCategoryChangeLogic";
import { changeRecipeCategory } from "../../core/services/catalogueWriteService";
import { syncCatalogueFromApi } from "../../core/services/catalogueSyncService";
import { syncFreezerFromApi } from "../../core/services/freezerService";
import { useRecipeBuilderStore } from "../store/useRecipeBuilderStore";
import { useRefreshStore } from "../store/useRefreshStore";
import { withPending } from "../utils/withPending";

export const RECIPE_CATEGORY_CHANGE_KEY = "recipe-category-change";

export function useRecipeCategoryChange() {
  return useCallback(async (apiId: string, target: CategoryChangeTarget): Promise<boolean> => {
    try {
      const done = await withPending(RECIPE_CATEGORY_CHANGE_KEY, async () => {
        await changeRecipeCategory(apiId, { categoryId: target.categoryId, code: target.code });
        await syncCatalogueFromApi();
        useRecipeBuilderStore.getState().patch({
          categoryId: target.categoryId,
          recipeNumber: target.recipeNumber,
          sourceCode: target.code,
        });
        await syncFreezerFromApi({ silent: true });
        useRefreshStore.getState().bump();
        return true;
      });
      return done === true;
    } catch {
      return false;
    }
  }, []);
}
