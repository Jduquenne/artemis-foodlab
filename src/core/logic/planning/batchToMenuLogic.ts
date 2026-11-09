import { addDays, isValid, parseISO } from "date-fns";
import { DAYS } from "../../domain/planningConfig";
import { MealSlot, SlotType } from "../../domain/planning";
import { formatDayDate, toIsoDate } from "../../utils/dateUtils";
import { dayNameOf, getMonday, getWeekNumber, getWeekYear } from "../../utils/weekUtils";
import { ParsedSlot } from "./planningSlotIdLogic";

export const BATCH_MENU_SLOTS = ["lunch", "dinner"] as const satisfies readonly SlotType[];

export interface BatchMenuDay {
  date: string;
  day: string;
  shortLabel: string;
  dateLabel: string;
}

export function slotTargetOf(isoDate: string, slot: SlotType): ParsedSlot | null {
  const date = parseISO(isoDate);
  if (!isValid(date)) return null;
  return { year: getWeekYear(date), week: getWeekNumber(date), day: dayNameOf(date), slot };
}

export function mondayOf(date: Date): Date {
  const monday = getMonday(date);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

export function shiftWeek(monday: Date, weeks: number): Date {
  return addDays(monday, weeks * 7);
}

export function isoWeekOf(monday: Date): { year: number; week: number } {
  return { year: getWeekYear(monday), week: getWeekNumber(monday) };
}

export function batchMenuWeek(monday: Date): BatchMenuDay[] {
  return DAYS.map((day, index) => ({
    date: toIsoDate(addDays(monday, index)),
    day,
    shortLabel: day.slice(0, 3),
    dateLabel: formatDayDate(monday, index),
  }));
}

export function plannedDishAt(slots: readonly MealSlot[], day: string, slot: SlotType): string | null {
  return slots.find((candidate) => candidate.day === day && candidate.slot === slot)?.recipeIds[0] ?? null;
}
