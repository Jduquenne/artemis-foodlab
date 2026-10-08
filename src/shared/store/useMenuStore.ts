import { create } from "zustand";
import { ShoppingDay } from "../../core/domain/planning";
import { EMPTY_RECIPE_FILTER, RecipeFilter } from "../../core/domain/recipeFilter";
import { normalizeRecipeFilter } from "../../core/logic/recipe/recipeFilterLogic";
import { clearAll as clearHouseholdItems } from "../../core/services/householdService";
import { replacePeriod } from "../../core/services/shoppingPeriodService";
import { readStorage, writeStorage } from "../utils/safeStorage";

function safeParseJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface MenuState {
  shoppingDays: ShoppingDay[];
  currentPeriodId: string | null;
  recipeFilter: RecipeFilter;
  setShoppingDays: (days: ShoppingDay[]) => Promise<void>;
  setRecipeFilter: (filter: RecipeFilter) => void;
  replaceShoppingPeriod: (period: { id: string | null; days: ShoppingDay[] }) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  shoppingDays: [],
  currentPeriodId: null,
  recipeFilter: normalizeRecipeFilter(safeParseJson<Partial<RecipeFilter> | null>("cipe_recipe_filter", EMPTY_RECIPE_FILTER)),

  setShoppingDays: async (days) => {
    const newPeriodId = await replacePeriod(days);
    set({ shoppingDays: days, currentPeriodId: newPeriodId });
    await clearHouseholdItems();
  },

  replaceShoppingPeriod: ({ id, days }) => {
    set({ currentPeriodId: id, shoppingDays: days });
  },

  setRecipeFilter: (filter) => {
    writeStorage("cipe_recipe_filter", JSON.stringify(filter));
    set({ recipeFilter: filter });
  },
}));
