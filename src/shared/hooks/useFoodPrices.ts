import { useMemo } from "react";
import { FoodPrice, PriceStore } from "../../core/domain/price";
import { effectivePriceStoreId, latestPricesByFood } from "../../core/logic/price/priceLogic";
import { useAuthStore } from "../store/useAuthStore";
import { usePriceStore } from "../store/usePriceStore";

export interface FoodPrices {
  stores: PriceStore[];
  store: PriceStore | null;
  priceByFood: Map<string, FoodPrice>;
}

export function useFoodPrices(): FoodPrices {
  const priceStoreId = useAuthStore((s) => s.user?.priceStoreId);
  const stores = usePriceStore((s) => s.stores);
  const prices = usePriceStore((s) => s.prices);
  return useMemo(() => {
    const storeId = effectivePriceStoreId(priceStoreId, stores);
    return {
      stores,
      store: stores.find((s) => s.id === storeId) ?? null,
      priceByFood: latestPricesByFood(prices, storeId),
    };
  }, [priceStoreId, stores, prices]);
}
