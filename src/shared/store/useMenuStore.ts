import { create } from "zustand";
import { WeeklyMenu } from "../../core/domain/types";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../../core/utils/dateUtils";
import { db } from "../../core/services/db";

interface MenuState {
  currentMenu: WeeklyMenu | null;
  currentWeek: number;
  currentYear: number;
  currentWeekId: string;
  isTransitionPopupOpen: boolean;
  setCurrentMenu: (menu: WeeklyMenu) => void;
  initWeek: () => Promise<void>;
  setTransitionPopup: (open: boolean) => void;
  updateMeal: (
    day: string,
    type: "lunch" | "dinner",
    recipeId: string | undefined,
  ) => Promise<void>;
  moveMeal: (
    from: { day: string; type: string },
    to: { day: string; type: string },
  ) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  currentWeekId: getWeekId(),
  isTransitionPopupOpen: false,
  currentMenu: null,
  currentWeek: getISOWeek(new Date()),
  currentYear: getISOWeekYear(new Date()),
  setCurrentMenu: (menu) => set({ currentMenu: menu }),

  initWeek: async () => {
    const todayId = getWeekId();
    const lastOpenedWeek = localStorage.getItem("cipe_last_opened_week");

    if (lastOpenedWeek && lastOpenedWeek !== todayId) {
      set({ isTransitionPopupOpen: true });
    }
    localStorage.setItem("cipe_last_opened_week", todayId);
  },

  setTransitionPopup: (open) => set({ isTransitionPopupOpen: open }),

  updateMeal: async (day, type, recipeId) => {
    // Logique de mise à jour dans Dexie (IndexedDB)
    await db.menus.where({ weekId: getWeekId() }).modify((m) => {
      m.days[day][type === "lunch" ? "lunchRecipeId" : "dinnerRecipeId"] =
        recipeId;
    });
    // On force le rafraîchissement via un trigger ou useLiveQuery
  },

  moveMeal: async (from, to) => {
    // Logique pour intervertir ou déplacer deux repas
    // Sera appelée à la fin du Drag & Drop
  },
}));
