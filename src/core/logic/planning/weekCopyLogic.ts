import { subDays } from "date-fns";
import { MealSlot, PlanningItemEntry } from "../../domain/planning";
import { getWeekNumber, getWeekYear } from "../../utils/weekUtils";

export interface WeekRef {
  year: number;
  week: number;
}

export function previousWeekOf(monday: Date): WeekRef {
  const previous = subDays(monday, 7);
  return { year: getWeekYear(previous), week: getWeekNumber(previous) };
}

export function weekCopyEntries(source: readonly MealSlot[], target: WeekRef): PlanningItemEntry[] {
  return source.flatMap((slot) => {
    const base = { year: target.year, week: target.week, day: slot.day, slot: slot.slot };
    return [
      ...slot.recipeIds.map((code) => ({ ...base, code, isDessert: false })),
      ...(slot.dessertIds ?? []).map((code) => ({ ...base, code, isDessert: true })),
    ];
  });
}

export function weekCopySummary(entries: readonly PlanningItemEntry[]): string {
  const dishes = entries.filter((entry) => !entry.isDessert).length;
  const desserts = entries.length - dishes;
  const plural = (count: number) => (count > 1 ? "s" : "");
  const parts = [`${dishes} repas`, ...(desserts > 0 ? [`${desserts} dessert${plural(desserts)}`] : [])];
  return parts.join(" et ");
}
