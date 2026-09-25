import { ShoppingDay } from "../domain/planning";
import { BaseEntry, ConsolidatedIngredient, ShoppingCatalogue } from "../domain/shopping";
import { aggregateBases, aggregateSlots, groupDaysByWeek } from "../logic/shopping/shoppingAggregation";
import { getWeekSlots } from "./planningService";

async function loadSlotsForDays(days: ShoppingDay[]) {
  const weeks = groupDaysByWeek(days);
  const perWeek = await Promise.all(weeks.map(({ year, week }) => getWeekSlots(year, week)));
  return weeks.flatMap((entry, i) => perWeek[i].filter((slot) => entry.days.has(slot.day)));
}

export const getShoppingListForDays = async (
  days: ShoppingDay[],
  catalogue: ShoppingCatalogue,
): Promise<ConsolidatedIngredient[]> => {
  if (days.length === 0) return [];
  return aggregateSlots(await loadSlotsForDays(days), catalogue);
};

export const getBasesForDays = async (
  days: ShoppingDay[],
  catalogue: ShoppingCatalogue,
): Promise<BaseEntry[]> => {
  if (days.length === 0) return [];
  return aggregateBases(await loadSlotsForDays(days), catalogue);
};
