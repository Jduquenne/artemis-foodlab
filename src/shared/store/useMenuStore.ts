import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../utils/dateUtils";
import { ShoppingDay } from "../../core/domain/types";
import { clearAll as clearHouseholdItems } from "../../core/services/householdService";
import { replacePeriod } from "../../core/services/shoppingPeriodService";

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
  currentPeriodId: string | null;
  activeFilterIds: string[];
  setShoppingDays: (days: ShoppingDay[]) => Promise<void>;
  setActiveFilterIds: (ids: string[]) => void;
  replaceShoppingPeriod: (period: { id: string | null; days: ShoppingDay[] }) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  currentWeekId: getWeekId(),
  currentWeek: getISOWeek(new Date()),
  currentYear: getISOWeekYear(new Date()),
  shoppingDays: safeParseJson<ShoppingDay[]>("cipe_shopping_days", []),
  currentPeriodId: null,
  activeFilterIds: safeParseJson<string[]>("cipe_active_filters", []),

  setShoppingDays: async (days) => {
    const newPeriodId = await replacePeriod(get().currentPeriodId, days);
    await clearHouseholdItems();
    localStorage.setItem("cipe_shopping_days", JSON.stringify(days));
    set({ shoppingDays: days, currentPeriodId: newPeriodId });
  },

  replaceShoppingPeriod: ({ id, days }) => {
    localStorage.setItem("cipe_shopping_days", JSON.stringify(days));
    set({ currentPeriodId: id, shoppingDays: days });
  },

  setActiveFilterIds: (ids) => {
    localStorage.setItem("cipe_active_filters", JSON.stringify(ids));
    set({ activeFilterIds: ids });
  },
}));
