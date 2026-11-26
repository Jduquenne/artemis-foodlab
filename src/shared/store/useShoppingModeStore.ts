import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ShoppingView } from "../../core/domain/shopping";

interface ShoppingModeState {
  view: ShoppingView;
  askPriceOnCheck: boolean;
  setView: (view: ShoppingView) => void;
  setAskPriceOnCheck: (value: boolean) => void;
}

export const useShoppingModeStore = create<ShoppingModeState>()(
  persist(
    (set) => ({
      view: "all",
      askPriceOnCheck: false,
      setView: (view) => set({ view }),
      setAskPriceOnCheck: (askPriceOnCheck) => set({ askPriceOnCheck }),
    }),
    {
      name: "cipe_shopping_mode",
      version: 2,
      migrate: (persisted) => {
        const askPriceOnCheck = typeof persisted === "object" && persisted !== null && "askPriceOnCheck" in persisted && persisted.askPriceOnCheck === true;
        return { view: "all", askPriceOnCheck };
      },
    }
  )
);
