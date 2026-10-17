import {
  GeneratedMeal,
  GeneratedSlotType,
  KCAL_SLOT_SHARE,
  KCAL_TOLERANCE,
  MealReason,
  MealReasonKind,
  PeriodDay,
} from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { DAYS } from "../../domain/planningConfig";
import { formatSourceDayShort, formatWeekdayShort, isoDateFromWeekDay } from "../../utils/dateUtils";
import { mealKey } from "./menuEngineLogic";

export interface PreviewColumn {
  date: string;
  label: string;
  inPeriod: boolean;
}

export interface PreviewWeek {
  key: string;
  label: string;
  columns: PreviewColumn[];
}

const BADGE_KINDS: readonly MealReasonKind[] = ["freezer", "offSeason", "repeat", "recent", "season"];

const MAX_BADGES = 2;

export interface DayKcalSummary {
  kcal: number | null;
  target: number | null;
  onTarget: boolean | null;
}

export function countGeneratedMeals(meals: readonly GeneratedMeal[]): number {
  return meals.filter((meal) => !meal.kept && meal.recipeCode !== null).length;
}

export function toggleMealLock(meals: readonly GeneratedMeal[], key: string): GeneratedMeal[] {
  return meals.map((meal) => (meal.key === key && !meal.kept && meal.recipeCode !== null ? { ...meal, locked: !meal.locked } : meal));
}

export function lockedMealsByKey(meals: readonly GeneratedMeal[]): Record<string, GeneratedMeal> {
  return Object.fromEntries(meals.filter((meal) => !meal.kept && meal.locked).map((meal) => [meal.key, meal]));
}

export function mealsAroundByKey(meals: readonly GeneratedMeal[], key: string): Record<string, GeneratedMeal> {
  return Object.fromEntries(meals.filter((meal) => !meal.kept && meal.key !== key).map((meal) => [meal.key, meal]));
}

export function rejectedForMeal(meals: readonly GeneratedMeal[], key: string): Record<string, string[]> {
  const code = meals.find((meal) => meal.key === key)?.recipeCode;
  return code ? { [key]: [code] } : {};
}

export function previewWeeks(days: readonly PeriodDay[]): PreviewWeek[] {
  const weeks = new Map<string, PeriodDay[]>();
  for (const day of days) {
    const key = `${day.year}-W${day.week}`;
    weeks.set(key, [...(weeks.get(key) ?? []), day]);
  }
  return [...weeks.entries()].map(([key, weekDays]) => {
    const { year, week } = weekDays[0];
    const inPeriod = new Set(weekDays.map((day) => day.date));
    const first = weekDays[0].date;
    const last = weekDays[weekDays.length - 1].date;
    const range = first === last ? formatSourceDayShort(first) : `${formatSourceDayShort(first)} → ${formatSourceDayShort(last)}`;
    return {
      key,
      label: `S${week} · ${range}`,
      columns: DAYS.map((dayName) => {
        const date = isoDateFromWeekDay(year, week, dayName);
        return { date, label: formatWeekdayShort(date), inPeriod: inPeriod.has(date) };
      }),
    };
  });
}

export function mealsByKey(meals: readonly GeneratedMeal[]): Record<string, GeneratedMeal> {
  return Object.fromEntries(meals.map((meal) => [meal.key, meal]));
}

export function reasonBadges(reasons: readonly MealReason[]): MealReasonKind[] {
  const kinds = new Set(reasons.map((reason) => reason.kind));
  return BADGE_KINDS.filter((kind) => kinds.has(kind)).slice(0, MAX_BADGES);
}

export function dayKcalSummary(
  date: string,
  slots: readonly GeneratedSlotType[],
  meals: Record<string, GeneratedMeal>,
  existing: Record<string, string[]>,
  macros: Record<string, Macronutrients>,
  dailyTarget: number | null,
): DayKcalSummary {
  const values = slots.flatMap((slot) => {
    const key = mealKey(date, slot);
    const meal = meals[key];
    const codes = meal?.kept ? (existing[key] ?? []) : meal?.recipeCode ? [meal.recipeCode] : [];
    return codes.map((code) => macros[code]?.kcal).filter((kcal): kcal is number => kcal !== undefined && kcal > 0);
  });
  const kcal = values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0)) : null;
  const share = slots.reduce((sum, slot) => sum + KCAL_SLOT_SHARE[slot], 0);
  const target = dailyTarget && dailyTarget > 0 && share > 0 ? Math.round(dailyTarget * share) : null;
  const onTarget = kcal !== null && target !== null ? Math.abs(kcal - target) / target <= KCAL_TOLERANCE : null;
  return { kcal, target, onTarget };
}
