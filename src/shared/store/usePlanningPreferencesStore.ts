import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DessertMovePreference } from "../../core/domain/planning";

interface PlanningPreferencesState {
  dessertMove: DessertMovePreference;
  setDessertMove: (dessertMove: DessertMovePreference) => void;
  mobileWeekView: boolean;
  setMobileWeekView: (mobileWeekView: boolean) => void;
}

export const usePlanningPreferencesStore = create<PlanningPreferencesState>()(
  persist(
    (set) => ({
      dessertMove: "ask",
      setDessertMove: (dessertMove) => set({ dessertMove }),
      mobileWeekView: false,
      setMobileWeekView: (mobileWeekView) => set({ mobileWeekView }),
    }),
    { name: "cipe_planning_preferences", version: 1 }
  )
);
