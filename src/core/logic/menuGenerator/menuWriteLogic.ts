import { GeneratedMeal } from "../../domain/menuGenerator";
import { BulkPlanningResult, PlanningItemEntry } from "../../domain/planning";

export function plannedEntries(meals: readonly GeneratedMeal[]): PlanningItemEntry[] {
  return meals.flatMap((meal) => {
    const base = { year: meal.day.year, week: meal.day.week, day: meal.day.day, slot: meal.slot };
    const dish = !meal.kept && meal.recipeCode ? [{ ...base, code: meal.recipeCode, isDessert: false }] : [];
    return [...dish, ...meal.dessertCodes.map((code) => ({ ...base, code, isDessert: true }))];
  });
}

export function menuWriteMessage({ written, skipped, writtenDesserts, skippedDesserts }: BulkPlanningResult): string {
  const plural = (count: number) => (count > 1 ? "s" : "");
  const parts = [`${written} repas`, ...(writtenDesserts > 0 ? [`${writtenDesserts} dessert${plural(writtenDesserts)}`] : [])];
  const added = `${parts.join(" et ")} ajouté${plural(written + writtenDesserts)} au planning`;
  const notes = [
    ...(skipped > 0 ? [`${skipped} créneau${skipped > 1 ? "x" : ""} déjà rempli${plural(skipped)} laissé${plural(skipped)} tel${plural(skipped)} quel${plural(skipped)}`] : []),
    ...(skippedDesserts > 0 ? [`${skippedDesserts} dessert${plural(skippedDesserts)} déjà présent${plural(skippedDesserts)} ou en trop`] : []),
  ];
  return notes.length > 0 ? `${added}, ${notes.join(", ")}.` : `${added}.`;
}
