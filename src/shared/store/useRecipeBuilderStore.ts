import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeBuilderState, DraftIngredient, initialRecipeBuilderState } from "../../core/domain/recipeBuilderTypes";

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
      draft: initialRecipeBuilderState(),
      patch: (update) => set((s) => ({ draft: { ...s.draft, ...update } })),
      patchIngredients: (ingredients) => set((s) => ({ draft: { ...s.draft, ingredients } })),
      reset: () => set({ draft: initialRecipeBuilderState() }),
      loadFromRecipe: (state) => set({ draft: state }),
    }),
    { name: "cipe_recipe_builder" }
  )
);
