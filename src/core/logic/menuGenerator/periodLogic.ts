import { addDays, differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { MAX_GENERATION_DAYS, PeriodDay } from "../../domain/menuGenerator";
import { toIsoDate } from "../../utils/dateUtils";
import { dayNameOf, getWeekNumber, getWeekYear } from "../../utils/weekUtils";

export function periodLength(startDate: string, endDate: string): number | null {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return null;
  return differenceInCalendarDays(end, start) + 1;
}

export function validatePeriod(startDate: string, endDate: string): string | null {
  const length = periodLength(startDate, endDate);
  if (length === null) return "Choisis une date de début et une date de fin.";
  if (length < 1) return "La date de fin doit suivre la date de début.";
  if (length > MAX_GENERATION_DAYS) return `La période ne peut pas dépasser ${MAX_GENERATION_DAYS} jours.`;
  return null;
}

export function buildPeriodDays(startDate: string, endDate: string): PeriodDay[] {
  if (validatePeriod(startDate, endDate)) return [];
  const start = parseISO(startDate);
  const length = periodLength(startDate, endDate) ?? 0;
  return Array.from({ length }, (_, index) => {
    const date = addDays(start, index);
    return {
      date: toIsoDate(date),
      year: getWeekYear(date),
      week: getWeekNumber(date),
      day: dayNameOf(date),
      month: date.getMonth() + 1,
    };
  });
}

export function periodWeeks(days: readonly PeriodDay[]): { year: number; week: number }[] {
  const seen = new Map<string, { year: number; week: number }>();
  for (const day of days) seen.set(`${day.year}-${day.week}`, { year: day.year, week: day.week });
  return [...seen.values()];
}
