import { GeneratedMeal } from "../../domain/menuGenerator";

export function groupMealsByDay(meals: readonly GeneratedMeal[]): { date: string; meals: GeneratedMeal[] }[] {
  const groups = new Map<string, GeneratedMeal[]>();
  for (const meal of meals) {
    const list = groups.get(meal.day.date) ?? [];
    list.push(meal);
    groups.set(meal.day.date, list);
  }
  return [...groups.entries()].map(([date, dayMeals]) => ({ date, meals: dayMeals }));
}

export function countGeneratedMeals(meals: readonly GeneratedMeal[]): number {
  return meals.filter((meal) => !meal.kept && meal.recipeCode !== null).length;
}
