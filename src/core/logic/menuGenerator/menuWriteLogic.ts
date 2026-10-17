import { GeneratedMeal } from "../../domain/menuGenerator";
import { BulkPlanningResult, PlanningItemEntry } from "../../domain/planning";

export function plannedEntries(meals: readonly GeneratedMeal[]): PlanningItemEntry[] {
  return meals.flatMap((meal) =>
    !meal.kept && meal.recipeCode
      ? [{ year: meal.day.year, week: meal.day.week, day: meal.day.day, slot: meal.slot, code: meal.recipeCode }]
      : [],
  );
}

export function menuWriteMessage({ written, skipped }: BulkPlanningResult): string {
  const added = `${written} repas ajouté${written > 1 ? "s" : ""} au planning`;
  if (skipped === 0) return `${added}.`;
  return `${added}, ${skipped} créneau${skipped > 1 ? "x" : ""} déjà rempli${skipped > 1 ? "s" : ""} laissé${skipped > 1 ? "s" : ""} tel${skipped > 1 ? "s" : ""} quel${skipped > 1 ? "s" : ""}.`;
}
