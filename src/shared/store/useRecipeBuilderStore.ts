import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeBuilderState, DraftIngredient } from "../../core/domain/recipeBuilderTypes";
import { initialRecipeBuilderState } from "../../core/logic/recipeBuilder/recipeBuilderState";
import { migrateDraftV2ToV3, migrateDraftV3ToV4 } from "../../core/logic/recipeBuilder/recipeBuilderMigration";

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
    {
      name: "cipe_recipe_builder",
      version: 4,
      migrate: (persisted, version) => {
        const v3 = version === 2 ? { draft: migrateDraftV2ToV3(persisted) } : persisted;
        return { draft: (version <= 3 ? migrateDraftV3ToV4(v3) : null) ?? initialRecipeBuilderState() };
      },
    }
  )
);
