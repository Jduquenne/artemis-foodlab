import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeBuilderState, DraftIngredient } from "../../core/domain/recipeBuilderTypes";
import { initialRecipeBuilderState } from "../../core/logic/recipeBuilder/recipeBuilderState";
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
      version: 2,
      migrate: () => ({ draft: freshDraft() }),
    }
  )
);
