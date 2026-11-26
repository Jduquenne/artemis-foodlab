import { PersonDefault } from "../../domain/personDefaults";
import { withDefaultPersons } from "./personDefaultsLogic";
import { MealSlot, SlotType } from "../../domain/planning";
import { MEAL_SLOTS } from "../../domain/planningConfig";
import { PlannableItem } from "../../domain/recipe";
import { dayNameOf, weekKeyOf } from "../../utils/weekUtils";

export interface TodayEntry {
  code: string;
  name: string;
  persons: number | undefined;
  isDessert: boolean;
}

export interface TodayMeal {
  slot: SlotType;
  day: string;
  entries: TodayEntry[];
}

export function plannedMealsOn(date: Date, slots: readonly MealSlot[], items: Record<string, PlannableItem>, defaults: readonly PersonDefault[]): TodayMeal[] {
  const day = dayNameOf(date);
  const { year, week } = weekKeyOf(date);
  return MEAL_SLOTS.flatMap((def) => {
    const found = slots.find((s) => s.year === year && s.week === week && s.day === day && s.slot === def.id);
    if (!found) return [];
    const slot = withDefaultPersons(found, defaults);
    const entries = [
      ...slot.recipeIds.map((code) => ({ code, name: items[code]?.name ?? code, persons: slot.recipePersons?.[code] ?? slot.persons, isDessert: false })),
      ...(slot.dessertIds ?? []).map((code) => ({ code, name: items[code]?.name ?? code, persons: slot.recipePersons?.[code] ?? slot.persons, isDessert: true })),
    ];
    return entries.length > 0 ? [{ slot: def.id, day, entries }] : [];
  });
}

export function slotsOfDay(date: Date, slots: readonly MealSlot[]): MealSlot[] {
  const day = dayNameOf(date);
  const { year, week } = weekKeyOf(date);
  return slots.filter((s) => s.year === year && s.week === week && s.day === day);
}
