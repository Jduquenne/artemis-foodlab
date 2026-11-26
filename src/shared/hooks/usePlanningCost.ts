import { useMemo } from "react";
import { MealSlot } from "../../core/domain/planning";
import { PlanningCost, planningCost } from "../../core/logic/price/planningCostLogic";
import { useProfileStore } from "../store/useProfileStore";
import { usePersonDefaultsStore } from "../store/usePersonDefaultsStore";
import { useFoodPrices } from "./useFoodPrices";
import { useMacroCatalogue } from "./useMacroCatalogue";

export function usePlanningCost(slots: readonly MealSlot[]): PlanningCost | null {
  const { recipes, foods, baseGrams, accompaniments } = useMacroCatalogue();
  const profiles = useProfileStore((s) => s.profiles);
  const personDefaults = usePersonDefaultsStore((s) => s.defaults);
  const { store, priceByFood } = useFoodPrices();
  return useMemo(
    () => (store && priceByFood.size > 0
      ? planningCost(slots, { recipes, foods, baseGrams, profiles, accompaniments, personDefaults }, priceByFood)
      : null),
    [slots, recipes, foods, baseGrams, profiles, accompaniments, personDefaults, store, priceByFood],
  );
}
