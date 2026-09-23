import { create } from "zustand";
import { JournalOverrideInput, saveJournalOverride, saveJournalSettings } from "../../core/services/journalService";
import { MacroTargets } from "../../core/domain/types";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { defaultIngredientOverridesForPortions, omitKey, scaleIngredientsByRatio } from "../../core/logic/journal/journalOverrideLogic";
import { RECIPE_BASE_GRAMS } from "../utils/macroUtils";

export interface JournalOverridesState {
  portionOverrides: Record<string, number>;
  gramOverrides: Record<string, number>;
  ingredientOverrides: Record<string, Record<string, number>>;
}

interface JournalState extends JournalOverridesState {
  kcalTarget: number;
  macroTargets: MacroTargets;
  setJournalSettings: (kcalTarget: number, macroTargets: MacroTargets) => Promise<void>;
  setPortionOverride: (planningSlotItemId: string, recipeId: string, value: number) => Promise<void>;
  setGramOverride: (planningSlotItemId: string, recipeId: string, value: number) => Promise<void>;
  setIngredientOverride: (planningSlotItemId: string, recipeId: string, ingredientId: string, grams: number) => Promise<void>;
  resetIngredientOverride: (planningSlotItemId: string, recipeId: string, ingredientId: string) => Promise<void>;
  replaceSettings: (settings: { kcalTarget: number; macroTargets: MacroTargets }) => void;
  replaceOverrides: (overrides: JournalOverridesState) => void;
}

const DEFAULT_KCAL_TARGET = 2000;
const DEFAULT_MACRO_TARGETS: MacroTargets = { proteins: 150, lipids: 65, carbohydrates: 250, fibers: 30 };

export const useJournalStore = create<JournalState>((set, get) => {
  const persistOverride = async (
    planningSlotItemId: string,
    patch: Partial<JournalOverrideInput>,
  ): Promise<void> => {
    const state = get();
    const input: JournalOverrideInput = {
      portionsOverride:
        patch.portionsOverride !== undefined ? patch.portionsOverride : state.portionOverrides[planningSlotItemId] ?? null,
      gramsOverride:
        patch.gramsOverride !== undefined ? patch.gramsOverride : state.gramOverrides[planningSlotItemId] ?? null,
      ingredientOverrides:
        patch.ingredientOverrides !== undefined
          ? patch.ingredientOverrides
          : state.ingredientOverrides[planningSlotItemId] ?? {},
    };
    const result = await saveJournalOverride(planningSlotItemId, input);
    set((s) => ({
      portionOverrides:
        result.portionsOverride != null
          ? { ...s.portionOverrides, [planningSlotItemId]: result.portionsOverride }
          : omitKey(s.portionOverrides, planningSlotItemId),
      gramOverrides:
        result.gramsOverride != null
          ? { ...s.gramOverrides, [planningSlotItemId]: result.gramsOverride }
          : omitKey(s.gramOverrides, planningSlotItemId),
      ingredientOverrides:
        result.ingredientOverrides.length > 0
          ? {
              ...s.ingredientOverrides,
              [planningSlotItemId]: Object.fromEntries(
                result.ingredientOverrides.map((i) => [i.recipeIngredientId, i.gramsOverride]),
              ),
            }
          : omitKey(s.ingredientOverrides, planningSlotItemId),
    }));
  };

  const defaultIngredientQuantities = (
    state: JournalState,
    recipeId: string,
    planningSlotItemId: string,
  ): Record<string, number> => {
    const recipe = typedRecipesDb[recipeId];
    const portions = state.portionOverrides[planningSlotItemId] ?? 1;
    return defaultIngredientOverridesForPortions(recipe, portions);
  };

  return {
    kcalTarget: DEFAULT_KCAL_TARGET,
    macroTargets: DEFAULT_MACRO_TARGETS,
    setJournalSettings: async (kcalTarget, macroTargets) => {
      await saveJournalSettings({ kcalTarget, macroTargets });
      set({ kcalTarget, macroTargets });
    },
    portionOverrides: {},
    gramOverrides: {},
    ingredientOverrides: {},
    setPortionOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = typedRecipesDb[recipeId];
      const ratio = recipe && recipe.defaultPortions > 0 ? value / recipe.defaultPortions : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, { portionsOverride: value, gramsOverride: null, ingredientOverrides });
    },
    setGramOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = typedRecipesDb[recipeId];
      const baseGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
      const ratio = baseGrams > 0 ? value / baseGrams : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, { portionsOverride: null, gramsOverride: value, ingredientOverrides });
    },
    setIngredientOverride: async (planningSlotItemId, recipeId, ingredientId, grams) => {
      const state = get();
      const existing = state.ingredientOverrides[planningSlotItemId];
      const baseline =
        existing && Object.keys(existing).length > 0 ? existing : defaultIngredientQuantities(state, recipeId, planningSlotItemId);
      await persistOverride(planningSlotItemId, { ingredientOverrides: { ...baseline, [ingredientId]: grams } });
    },
    resetIngredientOverride: async (planningSlotItemId, recipeId, ingredientId) => {
      const state = get();
      const existing = state.ingredientOverrides[planningSlotItemId];
      if (!existing) return;
      const defaults = defaultIngredientQuantities(state, recipeId, planningSlotItemId);
      await persistOverride(planningSlotItemId, {
        ingredientOverrides: { ...existing, [ingredientId]: defaults[ingredientId] ?? 0 },
      });
    },
    replaceSettings: ({ kcalTarget, macroTargets }) => set({ kcalTarget, macroTargets }),
    replaceOverrides: ({ portionOverrides, gramOverrides, ingredientOverrides }) =>
      set({ portionOverrides, gramOverrides, ingredientOverrides }),
  };
});
