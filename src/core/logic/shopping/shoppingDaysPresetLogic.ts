import { addDays } from "date-fns";
import { ShoppingDay } from "../../domain/planning";
import { MAX_SHOPPING_DAYS } from "../../domain/planningConfig";
import { dayNameOf, getWeekNumber, getWeekYear } from "../../utils/weekUtils";

export type ShoppingDaysMode = "adjust" | "new";

const sameDay = (a: ShoppingDay, b: ShoppingDay) => a.year === b.year && a.week === b.week && a.day === b.day;

export function defaultShoppingDaysMode(current: readonly ShoppingDay[], next: readonly ShoppingDay[]): ShoppingDaysMode {
  return current.some((day) => next.some((other) => sameDay(day, other))) ? "adjust" : "new";
}

export type ShoppingDaysPreset = "untilSunday" | "nextSevenDays" | "nextWeek";

export const SHOPPING_DAYS_PRESETS: readonly ShoppingDaysPreset[] = ["untilSunday", "nextSevenDays", "nextWeek"];

export const SHOPPING_DAYS_PRESET_LABELS: Record<ShoppingDaysPreset, string> = {
  untilSunday: "Jusqu'à dimanche",
  nextSevenDays: "Les 7 prochains jours",
  nextWeek: "La semaine prochaine",
};

export interface ShoppingDaysRange {
  first: Date;
  last: Date;
  days: ShoppingDay[];
}

export function shoppingDayOf(date: Date): ShoppingDay {
  return { year: getWeekYear(date), week: getWeekNumber(date), day: dayNameOf(date) };
}

function rangeFrom(start: Date, count: number): ShoppingDaysRange {
  const length = Math.max(1, Math.min(count, MAX_SHOPPING_DAYS));
  const dates = Array.from({ length }, (_, index) => addDays(start, index));
  return { first: dates[0] ?? start, last: dates[dates.length - 1] ?? start, days: dates.map(shoppingDayOf) };
}

export function presetShoppingDays(preset: ShoppingDaysPreset, today: Date): ShoppingDaysRange {
  const daysSinceMonday = (today.getDay() + 6) % 7;
  switch (preset) {
    case "untilSunday":
      return rangeFrom(today, 7 - daysSinceMonday);
    case "nextSevenDays":
      return rangeFrom(today, 7);
    case "nextWeek":
      return rangeFrom(addDays(today, 7 - daysSinceMonday), 7);
  }
}
