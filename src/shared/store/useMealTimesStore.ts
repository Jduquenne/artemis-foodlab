import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_MEAL_TIMES, MealTimes } from "../../core/domain/mealTimes";

interface MealTimesState {
  times: MealTimes;
  setTimes: (times: MealTimes) => void;
}

export const useMealTimesStore = create<MealTimesState>()(
  persist(
    (set) => ({
      times: DEFAULT_MEAL_TIMES,
      setTimes: (times) => set({ times }),
    }),
    { name: "cipe_meal_times", version: 1 }
  )
);
