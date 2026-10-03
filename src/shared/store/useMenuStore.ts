import { create } from "zustand";
import { getISOWeek, getISOWeekYear } from "date-fns";
import { getWeekId } from "../utils/dateUtils";
import { ShoppingDay } from "../../core/domain/planning";
import { EMPTY_RECIPE_FILTER, RecipeFilter } from "../../core/domain/recipeFilter";
import { normalizeRecipeFilter } from "../../core/logic/recipe/recipeFilterLogic";
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
  recipeFilter: RecipeFilter;
  setShoppingDays: (days: ShoppingDay[]) => Promise<void>;
  setRecipeFilter: (filter: RecipeFilter) => void;
  replaceShoppingPeriod: (period: { id: string | null; days: ShoppingDay[] }) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  currentWeekId: getWeekId(),
  currentWeek: getISOWeek(new Date()),
  currentYear: getISOWeekYear(new Date()),
  shoppingDays: [],
  currentPeriodId: null,
  recipeFilter: normalizeRecipeFilter(safeParseJson<Partial<RecipeFilter> | null>("cipe_recipe_filter", EMPTY_RECIPE_FILTER)),

  setShoppingDays: async (days) => {
    const newPeriodId = await replacePeriod(get().currentPeriodId, days);
    await clearHouseholdItems();
    set({ shoppingDays: days, currentPeriodId: newPeriodId });
  },

  replaceShoppingPeriod: ({ id, days }) => {
    set({ currentPeriodId: id, shoppingDays: days });
  },

  setRecipeFilter: (filter) => {
    localStorage.setItem("cipe_recipe_filter", JSON.stringify(filter));
    set({ recipeFilter: filter });
  },
}));
