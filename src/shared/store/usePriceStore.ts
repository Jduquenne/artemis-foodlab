import { create } from "zustand";
import { FoodPrice, FoodPriceInput, PriceStore, PriceStoreInput } from "../../core/domain/price";
import {
  createFoodPrice,
  createPriceStore,
  deleteFoodPrice,
  fetchFoodPriceHistory,
  updatePriceStore,
} from "../../core/services/priceService";
import { upsertById } from "../../core/utils/collectionUtils";

interface PriceState {
  stores: PriceStore[];
  prices: FoodPrice[];
  replacePrices: (stores: PriceStore[], prices: FoodPrice[]) => void;
  createStore: (input: PriceStoreInput) => Promise<PriceStore>;
  updateStore: (id: string, input: PriceStoreInput) => Promise<PriceStore>;
  recordPrice: (input: FoodPriceInput) => Promise<FoodPrice>;
  deletePrice: (price: FoodPrice) => Promise<void>;
}

const sameCouple = (a: Pick<FoodPrice, "foodId" | "storeId">, b: Pick<FoodPrice, "foodId" | "storeId">) =>
  a.foodId === b.foodId && a.storeId === b.storeId;

function toLatest({ id, foodId, storeId, pricePerKg, recordedAt }: FoodPrice): FoodPrice {
  return { id, foodId, storeId, pricePerKg, recordedAt };
}

export const usePriceStore = create<PriceState>((set, get) => ({
  stores: [],
  prices: [],
  replacePrices: (stores, prices) => set({ stores, prices }),
  createStore: async (input) => {
    const created = await createPriceStore(input);
    set({ stores: upsertById(get().stores, created) });
    return created;
  },
  updateStore: async (id, input) => {
    const updated = await updatePriceStore(id, input);
    set({ stores: upsertById(get().stores, updated) });
    return updated;
  },
  recordPrice: async (input) => {
    const created = toLatest(await createFoodPrice(input));
    const current = get().prices.find((p) => sameCouple(p, created));
    if (!current || created.recordedAt >= current.recordedAt) {
      set({ prices: [...get().prices.filter((p) => !sameCouple(p, created)), created] });
    }
    return created;
  },
  deletePrice: async (price) => {
    await deleteFoodPrice(price.id);
    set({ prices: get().prices.filter((p) => !sameCouple(p, price)) });
    const [previous] = await fetchFoodPriceHistory(price.foodId, price.storeId, 1).catch(() => []);
    if (previous && !get().prices.some((p) => sameCouple(p, previous))) {
      set({ prices: [...get().prices, toLatest(previous)] });
    }
  },
}));
