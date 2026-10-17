import { DayNutritionLimits, NUTRIENT_KEYS, NutrientKey } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";

export type DayNutrients = Record<NutrientKey, number>;

export const NUTRIENT_LABELS: Record<NutrientKey, { label: string; short: string; unit: string }> = {
  kcal: { label: "Calories", short: "kcal", unit: "kcal" },
  proteins: { label: "Protéines", short: "P", unit: "g" },
  carbohydrates: { label: "Glucides", short: "G", unit: "g" },
  lipids: { label: "Lipides", short: "L", unit: "g" },
};

export const DAY_NUTRITION_SCORE_CAP = 10;

export const EMPTY_NUTRIENTS: DayNutrients = { kcal: 0, proteins: 0, carbohydrates: 0, lipids: 0 };

export function hasDayLimits(limits: DayNutritionLimits): boolean {
  return NUTRIENT_KEYS.some((key) => limits.ranges[key].min !== null || limits.ranges[key].max !== null);
}

export function recipeNutrients(code: string | null | undefined, macros: Record<string, Macronutrients>): DayNutrients | null {
  const values = code ? macros[code] : undefined;
  if (!values || !(values.kcal > 0)) return null;
  return { kcal: values.kcal, proteins: values.proteins, carbohydrates: values.carbohydrates, lipids: values.lipids };
}

export function addNutrients(a: DayNutrients, b: DayNutrients): DayNutrients {
  return { kcal: a.kcal + b.kcal, proteins: a.proteins + b.proteins, carbohydrates: a.carbohydrates + b.carbohydrates, lipids: a.lipids + b.lipids };
}

export function nutrientDeviation(total: DayNutrients, limits: DayNutritionLimits, includeMin: boolean): number {
  return NUTRIENT_KEYS.reduce((sum, key) => {
    const { min, max } = limits.ranges[key];
    const value = total[key];
    if (max !== null && value > max) return sum + (value - max) / Math.max(max, 1);
    if (includeMin && min !== null && value < min) return sum + (min - value) / Math.max(min, 1);
    return sum;
  }, 0);
}

export function nutrientsOutOfLimits(total: DayNutrients, limits: DayNutritionLimits, includeMin: boolean): NutrientKey[] {
  return NUTRIENT_KEYS.filter((key) => {
    const { min, max } = limits.ranges[key];
    return (max !== null && total[key] > max) || (includeMin && min !== null && total[key] < min);
  });
}

export function bestDayDeviation(
  partial: DayNutrients,
  laterOptions: readonly DayNutrients[] | null,
  limits: DayNutritionLimits,
  includeMin: boolean,
): number {
  if (laterOptions === null) return nutrientDeviation(partial, limits, includeMin);
  if (laterOptions.length === 0) return nutrientDeviation(partial, limits, false);
  return Math.min(...laterOptions.map((option) => nutrientDeviation(addNutrients(partial, option), limits, includeMin)));
}

export function formatNutrients(total: DayNutrients): string {
  return NUTRIENT_KEYS.map((key) => `${Math.round(total[key])} ${key === "kcal" ? "kcal" : `g ${NUTRIENT_LABELS[key].short}`}`).join(" · ");
}

export function formatDayLimits(limits: DayNutritionLimits): string {
  return NUTRIENT_KEYS.flatMap((key) => {
    const { min, max } = limits.ranges[key];
    const { short, unit } = NUTRIENT_LABELS[key];
    if (min !== null && max !== null) return [`${short} ${min}-${max} ${unit}`];
    if (min !== null) return [`${short} ≥ ${min} ${unit}`];
    if (max !== null) return [`${short} ≤ ${max} ${unit}`];
    return [];
  }).join(", ");
}
