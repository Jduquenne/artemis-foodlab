import { create } from "zustand";
import { saveJournalOverride } from "../../core/services/journalService";
import { JournalOverrideInput, JournalOverrides, JournalOverridesByProfile } from "../../core/domain/journal";
import { recipesCatalogue } from "../../core/catalogue/recipes";
import {
  EMPTY_JOURNAL_OVERRIDES,
  applyOverrideResult,
  defaultIngredientOverridesForPortions,
  scaleIngredientsByRatio,
} from "../../core/logic/journal/journalOverrideLogic";
import { RECIPE_BASE_GRAMS } from "../utils/macroUtils";
import { useProfileStore } from "./useProfileStore";

interface JournalState {
  overridesByProfile: JournalOverridesByProfile;
  setPortionOverride: (planningSlotItemId: string, recipeId: string, value: number) => Promise<void>;
  setGramOverride: (planningSlotItemId: string, recipeId: string, value: number) => Promise<void>;
  setIngredientOverride: (planningSlotItemId: string, recipeId: string, ingredientId: string, grams: number) => Promise<void>;
  resetIngredientOverride: (planningSlotItemId: string, recipeId: string, ingredientId: string) => Promise<void>;
  replaceOverrides: (overridesByProfile: JournalOverridesByProfile) => void;
}

const activeProfileId = (): string | null => useProfileStore.getState().activeProfileId;

const overridesOf = (state: JournalState, profileId: string): JournalOverrides =>
  state.overridesByProfile[profileId] ?? EMPTY_JOURNAL_OVERRIDES;

export const useJournalStore = create<JournalState>((set, get) => {
  const persistOverride = async (
    planningSlotItemId: string,
    patch: Partial<JournalOverrideInput>,
  ): Promise<void> => {
    const profileId = activeProfileId();
    if (!profileId) return;
    const current = overridesOf(get(), profileId);
    const input: JournalOverrideInput = {
      portionsOverride:
        patch.portionsOverride !== undefined ? patch.portionsOverride : current.portionOverrides[planningSlotItemId] ?? null,
      gramsOverride:
        patch.gramsOverride !== undefined ? patch.gramsOverride : current.gramOverrides[planningSlotItemId] ?? null,
      ingredientOverrides:
        patch.ingredientOverrides !== undefined
          ? patch.ingredientOverrides
          : current.ingredientOverrides[planningSlotItemId] ?? {},
    };
    const result = await saveJournalOverride(planningSlotItemId, profileId, input);
    set((s) => ({
      overridesByProfile: {
        ...s.overridesByProfile,
        [profileId]: applyOverrideResult(overridesOf(s, profileId), planningSlotItemId, result),
      },
    }));
  };

  const defaultIngredientQuantities = (
    current: JournalOverrides,
    recipeId: string,
    planningSlotItemId: string,
  ): Record<string, number> => {
    const recipe = recipesCatalogue[recipeId];
    const portions = current.portionOverrides[planningSlotItemId] ?? 1;
    return defaultIngredientOverridesForPortions(recipe, portions);
  };

  const currentOverrides = (): JournalOverrides => {
    const profileId = activeProfileId();
    return profileId ? overridesOf(get(), profileId) : EMPTY_JOURNAL_OVERRIDES;
  };

  return {
    overridesByProfile: {},
    setPortionOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = recipesCatalogue[recipeId];
      const ratio = recipe && recipe.defaultPortions > 0 ? value / recipe.defaultPortions : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, { portionsOverride: value, gramsOverride: null, ingredientOverrides });
    },
    setGramOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = recipesCatalogue[recipeId];
      const baseGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
      const ratio = baseGrams > 0 ? value / baseGrams : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, { portionsOverride: null, gramsOverride: value, ingredientOverrides });
    },
    setIngredientOverride: async (planningSlotItemId, recipeId, ingredientId, grams) => {
      const current = currentOverrides();
      const existing = current.ingredientOverrides[planningSlotItemId];
      const baseline =
        existing && Object.keys(existing).length > 0 ? existing : defaultIngredientQuantities(current, recipeId, planningSlotItemId);
      await persistOverride(planningSlotItemId, { ingredientOverrides: { ...baseline, [ingredientId]: grams } });
    },
    resetIngredientOverride: async (planningSlotItemId, recipeId, ingredientId) => {
      const current = currentOverrides();
      const existing = current.ingredientOverrides[planningSlotItemId];
      if (!existing) return;
      const defaults = defaultIngredientQuantities(current, recipeId, planningSlotItemId);
      await persistOverride(planningSlotItemId, {
        ingredientOverrides: { ...existing, [ingredientId]: defaults[ingredientId] ?? 0 },
      });
    },
    replaceOverrides: (overridesByProfile) => set({ overridesByProfile }),
  };
});
