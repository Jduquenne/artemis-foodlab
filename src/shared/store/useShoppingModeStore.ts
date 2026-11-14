import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShoppingMode } from "../../core/domain/shopping";

interface ShoppingModeState {
  mode: ShoppingMode;
  askPriceOnCheck: boolean;
  setMode: (mode: ShoppingMode) => void;
  setAskPriceOnCheck: (value: boolean) => void;
}

export const useShoppingModeStore = create<ShoppingModeState>()(
  persist(
    (set) => ({
      mode: "home",
      askPriceOnCheck: false,
      setMode: (mode) => set({ mode }),
      setAskPriceOnCheck: (askPriceOnCheck) => set({ askPriceOnCheck }),
    }),
    { name: "cipe_shopping_mode", version: 1 }
  )
);
