import { useEffect, useState } from "react";
import { FoodPriceEntry } from "../../core/domain/price";
import { fetchFoodPriceHistory } from "../../core/services/priceService";

const HISTORY_LIMIT = 20;

export interface FoodPriceHistory {
  entries: FoodPriceEntry[] | null;
  loading: boolean;
  error: boolean;
}

interface HistoryState {
  key: string;
  entries: FoodPriceEntry[] | null;
  error: boolean;
}

export function useFoodPriceHistory(foodId: string, storeId: string, revision: string): FoodPriceHistory {
  const key = `${foodId}:${storeId}:${revision}`;
  const [state, setState] = useState<HistoryState>({ key: "", entries: null, error: false });

  useEffect(() => {
    let active = true;
    fetchFoodPriceHistory(foodId, storeId, HISTORY_LIMIT).then(
      (entries) => {
        if (active) setState({ key, entries, error: false });
      },
      () => {
        if (active) setState({ key, entries: null, error: true });
      },
    );
    return () => {
      active = false;
    };
  }, [foodId, storeId, key]);

  return { entries: state.entries, loading: state.key !== key, error: state.key === key && state.error };
}
