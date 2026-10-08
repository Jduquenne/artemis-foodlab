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
import { RECIPE_BASE_GRAMS } from "../../core/catalogue/recipeMetrics";
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
  const queues = new Map<string, Promise<void>>();

  const persistOverride = (
    planningSlotItemId: string,
    buildPatch: (current: JournalOverrides) => Partial<JournalOverrideInput> | null,
  ): Promise<void> => {
    const profileId = activeProfileId();
    if (!profileId) return Promise.resolve();
    const queueKey = `${profileId}:${planningSlotItemId}`;
    const run = () => saveOverride(profileId, planningSlotItemId, buildPatch);
    const next = (queues.get(queueKey) ?? Promise.resolve()).then(run);
    const settled = next.catch(() => undefined);
    queues.set(queueKey, settled);
    settled.then(() => {
      if (queues.get(queueKey) === settled) queues.delete(queueKey);
    });
    return next;
  };

  const saveOverride = async (
    profileId: string,
    planningSlotItemId: string,
    buildPatch: (current: JournalOverrides) => Partial<JournalOverrideInput> | null,
  ): Promise<void> => {
    const current = overridesOf(get(), profileId);
    const patch = buildPatch(current);
    if (!patch) return;
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

  return {
    overridesByProfile: {},
    setPortionOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = recipesCatalogue[recipeId];
      const ratio = recipe && recipe.defaultPortions > 0 ? value / recipe.defaultPortions : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, () => ({ portionsOverride: value, gramsOverride: null, ingredientOverrides }));
    },
    setGramOverride: async (planningSlotItemId, recipeId, value) => {
      const recipe = recipesCatalogue[recipeId];
      const baseGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
      const ratio = baseGrams > 0 ? value / baseGrams : 1;
      const ingredientOverrides = recipe ? scaleIngredientsByRatio(recipe, ratio) : {};
      await persistOverride(planningSlotItemId, () => ({ portionsOverride: null, gramsOverride: value, ingredientOverrides }));
    },
    setIngredientOverride: async (planningSlotItemId, recipeId, ingredientId, grams) => {
      await persistOverride(planningSlotItemId, (current) => {
        const existing = current.ingredientOverrides[planningSlotItemId];
        const baseline =
          existing && Object.keys(existing).length > 0 ? existing : defaultIngredientQuantities(current, recipeId, planningSlotItemId);
        return { ingredientOverrides: { ...baseline, [ingredientId]: grams } };
      });
    },
    resetIngredientOverride: async (planningSlotItemId, recipeId, ingredientId) => {
      await persistOverride(planningSlotItemId, (current) => {
        const existing = current.ingredientOverrides[planningSlotItemId];
        if (!existing) return null;
        const defaults = defaultIngredientQuantities(current, recipeId, planningSlotItemId);
        return { ingredientOverrides: { ...existing, [ingredientId]: defaults[ingredientId] ?? 0 } };
      });
    },
    replaceOverrides: (overridesByProfile) => set({ overridesByProfile }),
  };
});
