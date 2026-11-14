import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShoppingMode } from "../../core/domain/shopping";

interface ShoppingModeState {
  mode: ShoppingMode;
  setMode: (mode: ShoppingMode) => void;
}

export const useShoppingModeStore = create<ShoppingModeState>()(
  persist(
    (set) => ({
      mode: "home",
      setMode: (mode) => set({ mode }),
    }),
    { name: "cipe_shopping_mode", version: 1 }
  )
);
