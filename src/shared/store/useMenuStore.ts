import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../../core/utils/dateUtils";

interface MenuState {
  currentWeek: number;
  currentYear: number;
  currentWeekId: string;
  isTransitionPopupOpen: boolean;
  initWeek: () => Promise<void>;
  setTransitionPopup: (open: boolean) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  currentWeekId: getWeekId(),
  isTransitionPopupOpen: false,
  currentWeek: getISOWeek(new Date()),
  currentYear: getISOWeekYear(new Date()),

  initWeek: async () => {
    const todayId = getWeekId();
    const lastOpenedWeek = localStorage.getItem("cipe_last_opened_week");

    if (lastOpenedWeek && lastOpenedWeek !== todayId) {
      set({ isTransitionPopupOpen: true });
    }
    localStorage.setItem("cipe_last_opened_week", todayId);
  },

  setTransitionPopup: (open) => set({ isTransitionPopupOpen: open }),
}));
