import { create } from "zustand";
import { CustomShoppingCategory } from "../../core/domain/shopping";
import {
  createCustomShoppingCategory,
  deleteCustomShoppingCategory,
  renameCustomShoppingCategory,
} from "../../core/services/customShoppingCategoryService";

interface CustomShoppingCategoryState {
  categories: CustomShoppingCategory[];
  replaceCategories: (categories: CustomShoppingCategory[]) => void;
  createCategory: (label: string) => Promise<CustomShoppingCategory>;
  renameCategory: (id: string, label: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCustomShoppingCategoryStore = create<CustomShoppingCategoryState>((set, get) => ({
  categories: [],
  replaceCategories: (categories) => set({ categories }),
  createCategory: async (label) => {
    const created = await createCustomShoppingCategory(label);
    set({ categories: [...get().categories, created] });
    return created;
  },
  renameCategory: async (id, label) => {
    const updated = await renameCustomShoppingCategory(id, label);
    set({ categories: get().categories.map((c) => (c.id === id ? updated : c)) });
  },
  deleteCategory: async (id) => {
    await deleteCustomShoppingCategory(id);
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
}));
