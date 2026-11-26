import { create } from "zustand";
import { ShoppingDay } from "../../core/domain/planning";
import { EMPTY_RECIPE_FILTER, RecipeFilter } from "../../core/domain/recipeFilter";
import { normalizeRecipeFilter } from "../../core/logic/recipe/recipeFilterLogic";
import { clearAll as clearHouseholdItems } from "../../core/services/householdService";
import { replacePeriod, updatePeriodDays } from "../../core/services/shoppingPeriodService";
import { ShoppingDaysMode } from "../../core/logic/shopping/shoppingDaysPresetLogic";
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
  setShoppingDays: (days: ShoppingDay[], mode: ShoppingDaysMode) => Promise<void>;
  setRecipeFilter: (filter: RecipeFilter) => void;
  replaceShoppingPeriod: (period: { id: string | null; days: ShoppingDay[] }) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  shoppingDays: [],
  currentPeriodId: null,
  recipeFilter: normalizeRecipeFilter(safeParseJson<Partial<RecipeFilter> | null>("cipe_recipe_filter", EMPTY_RECIPE_FILTER)),

  setShoppingDays: async (days, mode) => {
    const periodId = get().currentPeriodId;
    if (mode === "adjust" && periodId !== null && days.length > 0) {
      await updatePeriodDays(periodId, days);
      set({ shoppingDays: days });
      return;
    }
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
