import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../../core/utils/dateUtils";
import { ShoppingDay } from "../../core/domain/types";

function safeParseJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

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
  shoppingDays: safeParseJson<ShoppingDay[]>("cipe_shopping_days", []),
  activeFilterIds: safeParseJson<string[]>("cipe_active_filters", []),

  setShoppingDays: (days) => {
    localStorage.setItem("cipe_shopping_days", JSON.stringify(days));
    set({ shoppingDays: days });
  },

  setActiveFilterIds: (ids) => {
    localStorage.setItem("cipe_active_filters", JSON.stringify(ids));
    set({ activeFilterIds: ids });
  },
}));
