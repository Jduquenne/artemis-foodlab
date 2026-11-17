import { useMemo } from "react";
import { FoodCooking } from "../../core/domain/cooking";
import { cookingsByFood } from "../../core/logic/cooking/cookingLogic";
import { useFoodCookingStore } from "../store/useFoodCookingStore";

export function useFoodCookings(): Map<string, FoodCooking[]> {
  const cookings = useFoodCookingStore((s) => s.cookings);
  return useMemo(() => cookingsByFood(cookings), [cookings]);
}
