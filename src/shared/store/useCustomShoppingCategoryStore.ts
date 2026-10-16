import { create } from "zustand";
import { CustomShoppingCategory } from "../../core/domain/shopping";

interface CustomShoppingCategoryState {
  categories: CustomShoppingCategory[];
  replaceCategories: (categories: CustomShoppingCategory[]) => void;
}

export const useCustomShoppingCategoryStore = create<CustomShoppingCategoryState>((set) => ({
  categories: [],
  replaceCategories: (categories) => set({ categories }),
}));
