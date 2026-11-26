import { addDays } from "date-fns";
import { MealSlot, SlotType } from "../../domain/planning";
import { MEAL_SLOTS, NEXT_MEAL_END_HOURS } from "../../domain/planningConfig";
import { dayNameOf, getWeekNumber, getWeekYear } from "../../utils/weekUtils";

export interface NextMeal {
  recipeId: string;
  persons: number | undefined;
  label: string;
  day: string;
  slot: SlotType;
}

const TODAY_LABELS: Record<SlotType, string> = {
  breakfast: "Ce matin",
  lunch: "Ce midi",
  snack: "Au goûter",
  dinner: "Ce soir",
};

const TOMORROW_LABELS: Record<SlotType, string> = {
  breakfast: "Demain matin",
  lunch: "Demain midi",
  snack: "Demain au goûter",
  dinner: "Demain soir",
};

export interface WeekKey {
  year: number;
  week: number;
}

export function weekKeyOf(date: Date): WeekKey {
  return { year: getWeekYear(date), week: getWeekNumber(date) };
}

function firstPlannedRecipe(slot: MealSlot | undefined, isKnown: (code: string) => boolean): string | null {
  return slot?.recipeIds.find(isKnown) ?? null;
}

function mealOfDay(slots: readonly MealSlot[], date: Date, fromHour: number | null, isKnown: (code: string) => boolean, labels: Record<SlotType, string>): NextMeal | null {
  const day = dayNameOf(date);
  const { year, week } = weekKeyOf(date);
  for (const def of MEAL_SLOTS) {
    if (fromHour !== null && fromHour >= NEXT_MEAL_END_HOURS[def.id]) continue;
    const slot = slots.find((s) => s.year === year && s.week === week && s.day === day && s.slot === def.id);
    const recipeId = firstPlannedRecipe(slot, isKnown);
    if (slot && recipeId) return { recipeId, persons: slot.recipePersons?.[recipeId] ?? slot.persons, label: labels[def.id], day, slot: def.id };
  }
  return null;
}

export function findNextMeal(slots: readonly MealSlot[], now: Date, isKnown: (code: string) => boolean): NextMeal | null {
  return mealOfDay(slots, now, now.getHours(), isKnown, TODAY_LABELS) ?? mealOfDay(slots, addDays(now, 1), null, isKnown, TOMORROW_LABELS);
}
