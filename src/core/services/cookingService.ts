import { FoodCooking, FoodCookingInput } from "../domain/cooking";
import { apiFetchJson } from "./apiClient";

export function saveFoodCookings(foodId: string, cookings: FoodCookingInput[]): Promise<FoodCooking[]> {
  return apiFetchJson<FoodCooking[]>(`/foods/${encodeURIComponent(foodId)}/cookings`, {
    method: "PUT",
    body: { cookings },
  });
}
