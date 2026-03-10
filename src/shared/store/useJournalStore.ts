import { create } from "zustand";

interface JournalState {
  kcalTarget: number;
  setKcalTarget: (value: number) => void;
  portionOverrides: Record<string, number>;
  setPortionOverride: (key: string, value: number) => void;
}

const loadPortionOverrides = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem("cipe_portion_overrides") ?? "{}");
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
  portionOverrides: loadPortionOverrides(),
  setPortionOverride: (key, value) => {
    set((state) => {
      const next = { ...state.portionOverrides, [key]: value };
      localStorage.setItem("cipe_portion_overrides", JSON.stringify(next));
      return { portionOverrides: next };
    });
  },
}));
