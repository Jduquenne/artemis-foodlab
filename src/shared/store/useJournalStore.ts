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

const DEFAULT_KCAL_TARGET = 2000;
const DEFAULT_MACRO_TARGETS: MacroTargets = { proteins: 150, lipids: 65, carbohydrates: 250, fibers: 30 };

export const useJournalStore = create<JournalState>((set) => ({
  kcalTarget: DEFAULT_KCAL_TARGET,
  macroTargets: DEFAULT_MACRO_TARGETS,
  setJournalSettings: async (kcalTarget, macroTargets) => {
    await saveJournalSettings({ kcalTarget, macroTargets });
    set({ kcalTarget, macroTargets });
  },
  portionOverrides: {},
  setPortionOverride: async (planningSlotItemId, value) => {
    await savePortionOverride(planningSlotItemId, value);
    set((state) => ({ portionOverrides: { ...state.portionOverrides, [planningSlotItemId]: value } }));
  },
  gramOverrides: {},
  setGramOverride: async (planningSlotItemId, value) => {
    await saveGramOverride(planningSlotItemId, value);
    set((state) => ({ gramOverrides: { ...state.gramOverrides, [planningSlotItemId]: value } }));
  },
  replaceSettings: ({ kcalTarget, macroTargets }) => set({ kcalTarget, macroTargets }),
  replaceOverrides: ({ portionOverrides, gramOverrides }) => set({ portionOverrides, gramOverrides }),
}));
