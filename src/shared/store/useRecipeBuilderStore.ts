import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeBuilderState, DraftIngredient, initialRecipeBuilderState } from "../../features/recipeBuilder/types";

interface RecipeBuilderStore {
  draft: RecipeBuilderState;
  patch: (update: Partial<RecipeBuilderState>) => void;
  patchIngredients: (ingredients: DraftIngredient[]) => void;
  reset: () => void;
}

export const useRecipeBuilderStore = create<RecipeBuilderStore>()(
  persist(
    (set) => ({
      draft: initialRecipeBuilderState(),
      patch: (update) => set((s) => ({ draft: { ...s.draft, ...update } })),
      patchIngredients: (ingredients) => set((s) => ({ draft: { ...s.draft, ingredients } })),
      reset: () => set({ draft: initialRecipeBuilderState() }),
    }),
    { name: "cipe_recipe_builder" }
  )
);
