import { create } from "zustand";

export interface MacroTargets {
  proteins: number;
  lipids: number;
  carbohydrates: number;
  fibers: number;
}

interface JournalState {
  kcalTarget: number;
  setKcalTarget: (value: number) => void;
  macroTargets: MacroTargets;
  setMacroTargets: (targets: MacroTargets) => void;
  portionOverrides: Record<string, number>;
  setPortionOverride: (key: string, value: number) => void;
  gramOverrides: Record<string, number>;
  setGramOverride: (key: string, value: number) => void;
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
  setKcalTarget: (value) => {
    localStorage.setItem("cipe_kcal_target", String(value));
    set({ kcalTarget: value });
  },
  macroTargets: loadMacroTargets(),
  setMacroTargets: (targets) => {
    localStorage.setItem("cipe_macro_targets", JSON.stringify(targets));
    set({ macroTargets: targets });
  },
  portionOverrides: loadPortionOverrides(),
  setPortionOverride: (key, value) => {
    set((state) => {
      const next = { ...state.portionOverrides, [key]: value };
      localStorage.setItem("cipe_portion_overrides", JSON.stringify(next));
      return { portionOverrides: next };
    });
  },
  gramOverrides: loadGramOverrides(),
  setGramOverride: (key, value) => {
    set((state) => {
      const next = { ...state.gramOverrides, [key]: value };
      localStorage.setItem("cipe_gram_overrides", JSON.stringify(next));
      return { gramOverrides: next };
    });
  },
}));
