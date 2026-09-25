import { Macronutrients } from "../../domain/nutrition";
import { MealSlot } from "../../domain/planning";
import { MacroCatalogue, computeDayMacros } from "../../../shared/utils/macroUtils";

export interface WeekAverageResult {
  average: Macronutrients;
  countedDays: number;
}

export const DEFAULT_AVERAGE_DAYS: readonly string[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const EMPTY_MACROS: Macronutrients = { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };

export function isDayFilled(slots: MealSlot[]): boolean {
  return slots.some((s) => s.recipeIds.length > 0 || (s.dessertIds?.length ?? 0) > 0);
}

export function computeWeekAverage(
  catalogue: MacroCatalogue,
  weekSlots: MealSlot[],
  days: readonly string[],
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
  ingredientOverrides: Record<string, Record<string, number>>,
): WeekAverageResult {
  const filledDays = days
    .map((day) => weekSlots.filter((s) => s.day === day))
    .filter(isDayFilled);

  if (filledDays.length === 0) return { average: { ...EMPTY_MACROS }, countedDays: 0 };

  const total = filledDays.reduce<Macronutrients>((sum, slots) => {
    const m = computeDayMacros(catalogue, slots, portionOverrides, gramOverrides, ingredientOverrides);
    return {
      kcal: sum.kcal + m.kcal,
      proteins: sum.proteins + m.proteins,
      lipids: sum.lipids + m.lipids,
      carbohydrates: sum.carbohydrates + m.carbohydrates,
      fibers: sum.fibers + m.fibers,
    };
  }, { ...EMPTY_MACROS });

  const n = filledDays.length;
  return {
    average: {
      kcal: total.kcal / n,
      proteins: total.proteins / n,
      lipids: total.lipids / n,
      carbohydrates: total.carbohydrates / n,
      fibers: total.fibers / n,
    },
    countedDays: n,
  };
}
