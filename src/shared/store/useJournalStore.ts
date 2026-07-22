import { create } from "zustand";
import { saveGramOverride, saveJournalSettings, savePortionOverride } from "../../core/services/journalService";
import { MacroTargets } from "../../core/domain/types";

interface JournalState {
  kcalTarget: number;
  macroTargets: MacroTargets;
  setJournalSettings: (kcalTarget: number, macroTargets: MacroTargets) => Promise<void>;
  portionOverrides: Record<string, number>;
  setPortionOverride: (planningSlotItemId: string, value: number) => Promise<void>;
  gramOverrides: Record<string, number>;
  setGramOverride: (planningSlotItemId: string, value: number) => Promise<void>;
  replaceSettings: (settings: { kcalTarget: number; macroTargets: MacroTargets }) => void;
  replaceOverrides: (overrides: { portionOverrides: Record<string, number>; gramOverrides: Record<string, number> }) => void;
}

const DEFAULT_MACRO_TARGETS: MacroTargets = { proteins: 150, lipids: 65, carbohydrates: 250, fibers: 30 };

const loadMacroTargets = (): MacroTargets => {
  try {
    return JSON.parse(localStorage.getItem("cipe_macro_targets") ?? "null") ?? DEFAULT_MACRO_TARGETS;
  } catch {
    return DEFAULT_MACRO_TARGETS;
  }
};

const loadPortionOverrides = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem("cipe_portion_overrides") ?? "{}");
  } catch {
    return {};
  }
};

const loadGramOverrides = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem("cipe_gram_overrides") ?? "{}");
  } catch {
    return {};
  }
};

export const useJournalStore = create<JournalState>((set) => ({
  kcalTarget: parseInt(localStorage.getItem("cipe_kcal_target") ?? "2000", 10),
  macroTargets: loadMacroTargets(),
  setJournalSettings: async (kcalTarget, macroTargets) => {
    await saveJournalSettings({ kcalTarget, macroTargets });
    localStorage.setItem("cipe_kcal_target", String(kcalTarget));
    localStorage.setItem("cipe_macro_targets", JSON.stringify(macroTargets));
    set({ kcalTarget, macroTargets });
  },
  portionOverrides: loadPortionOverrides(),
  setPortionOverride: async (planningSlotItemId, value) => {
    await savePortionOverride(planningSlotItemId, value);
    set((state) => {
      const next = { ...state.portionOverrides, [planningSlotItemId]: value };
      localStorage.setItem("cipe_portion_overrides", JSON.stringify(next));
      return { portionOverrides: next };
    });
  },
  gramOverrides: loadGramOverrides(),
  setGramOverride: async (planningSlotItemId, value) => {
    await saveGramOverride(planningSlotItemId, value);
    set((state) => {
      const next = { ...state.gramOverrides, [planningSlotItemId]: value };
      localStorage.setItem("cipe_gram_overrides", JSON.stringify(next));
      return { gramOverrides: next };
    });
  },
  replaceSettings: ({ kcalTarget, macroTargets }) => {
    localStorage.setItem("cipe_kcal_target", String(kcalTarget));
    localStorage.setItem("cipe_macro_targets", JSON.stringify(macroTargets));
    set({ kcalTarget, macroTargets });
  },
  replaceOverrides: ({ portionOverrides, gramOverrides }) => {
    localStorage.setItem("cipe_portion_overrides", JSON.stringify(portionOverrides));
    localStorage.setItem("cipe_gram_overrides", JSON.stringify(gramOverrides));
    set({ portionOverrides, gramOverrides });
  },
}));
