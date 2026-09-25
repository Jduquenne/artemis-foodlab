import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeBuilderState, DraftIngredient } from "../../core/domain/recipeBuilderTypes";
import { initialRecipeBuilderState } from "../../core/logic/recipeBuilder/recipeBuilderState";
import { migrateDraftV2ToV3 } from "../../core/logic/recipeBuilder/recipeBuilderMigration";
import { suggestNextRecipeNumber } from "../../core/logic/recipeBuilder/recipeBuilderLogic";

function freshDraft(): RecipeBuilderState {
  const draft = initialRecipeBuilderState();
  return { ...draft, recipeNumber: suggestNextRecipeNumber(draft.categoryId) };
}

interface RecipeBuilderStore {
  draft: RecipeBuilderState;
  patch: (update: Partial<RecipeBuilderState>) => void;
  patchIngredients: (ingredients: DraftIngredient[]) => void;
  reset: () => void;
  loadFromRecipe: (state: RecipeBuilderState) => void;
}

export const useRecipeBuilderStore = create<RecipeBuilderStore>()(
  persist(
    (set) => ({
      draft: freshDraft(),
      patch: (update) => set((s) => ({ draft: { ...s.draft, ...update } })),
      patchIngredients: (ingredients) => set((s) => ({ draft: { ...s.draft, ingredients } })),
      reset: () => set({ draft: freshDraft() }),
      loadFromRecipe: (state) => set({ draft: state }),
    }),
    {
      name: "cipe_recipe_builder",
      version: 3,
      migrate: (persisted, version) => ({
        draft: (version === 2 ? migrateDraftV2ToV3(persisted) : null) ?? freshDraft(),
      }),
    }
  )
);
