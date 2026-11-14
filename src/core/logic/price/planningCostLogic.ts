import { MealSlot } from "../../domain/planning";
import { DAYS } from "../../domain/planningConfig";
import { FoodPrice } from "../../domain/price";
import { ShoppingCatalogue } from "../../domain/shopping";
import { aggregateSlots } from "../shopping/shoppingAggregation";
import { CostEstimate, PricedLine, estimateCost } from "./priceLogic";

export interface PlanningCost {
  days: Record<string, CostEstimate>;
  week: CostEstimate;
}

function plannedLines(slots: MealSlot[], catalogue: ShoppingCatalogue): PricedLine[] {
  return aggregateSlots(slots, catalogue).map((ing) => ({
    key: ing.key,
    name: ing.name,
    foodId: ing.foodId,
    quantity: ing.totalQuantity,
    unit: ing.unit,
  }));
}

export function planningCost(slots: readonly MealSlot[], catalogue: ShoppingCatalogue, prices: Map<string, FoodPrice>): PlanningCost {
  const cost = (daySlots: MealSlot[]) => estimateCost(plannedLines(daySlots, catalogue), catalogue.foods, prices);
  return {
    days: Object.fromEntries(DAYS.map((day) => [day, cost(slots.filter((slot) => slot.day === day))])),
    week: cost([...slots]),
  };
}
