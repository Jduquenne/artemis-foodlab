import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../../core/utils/dateUtils";
import { ShoppingDay } from "../../core/domain/types";

interface MenuState {
  currentWeek: number;
  currentYear: number;
  currentWeekId: string;
  shoppingDays: ShoppingDay[];
  activeFilterIds: string[];
  setShoppingDays: (days: ShoppingDay[]) => void;
  setActiveFilterIds: (ids: string[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  currentWeekId: getWeekId(),
  currentWeek: getISOWeek(new Date()),
  currentYear: getISOWeekYear(new Date()),
  shoppingDays: JSON.parse(localStorage.getItem("cipe_shopping_days") ?? "[]"),
  activeFilterIds: JSON.parse(localStorage.getItem("cipe_active_filters") ?? "[]"),

  setShoppingDays: (days) => {
    localStorage.setItem("cipe_shopping_days", JSON.stringify(days));
    set({ shoppingDays: days });
  },

  setActiveFilterIds: (ids) => {
    localStorage.setItem("cipe_active_filters", JSON.stringify(ids));
    set({ activeFilterIds: ids });
  },
}));
