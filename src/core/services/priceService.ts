import { FoodPriceEntry, FoodPriceInput, PriceStore, PriceStoreInput } from "../domain/price";
import { apiFetch, apiFetchJson } from "./apiClient";

export function createPriceStore(input: PriceStoreInput): Promise<PriceStore> {
  return apiFetchJson<PriceStore>("/price-stores", { method: "POST", body: input });
}

export function updatePriceStore(id: string, input: PriceStoreInput): Promise<PriceStore> {
  return apiFetchJson<PriceStore>(`/price-stores/${id}`, { method: "PUT", body: input });
}

export async function deletePriceStore(id: string): Promise<void> {
  await apiFetch(`/price-stores/${id}`, { method: "DELETE" });
}

export function createFoodPrice(input: FoodPriceInput): Promise<FoodPriceEntry> {
  return apiFetchJson<FoodPriceEntry>("/food-prices", { method: "POST", body: input });
}

export async function deleteFoodPrice(id: string): Promise<void> {
  await apiFetch(`/food-prices/${id}`, { method: "DELETE" });
}

export function fetchFoodPriceHistory(foodId: string, storeId: string, limit = 100): Promise<FoodPriceEntry[]> {
  const params = new URLSearchParams({ foodId, storeId, limit: String(limit) });
  return apiFetchJson<FoodPriceEntry[]>(`/food-prices?${params.toString()}`);
}
