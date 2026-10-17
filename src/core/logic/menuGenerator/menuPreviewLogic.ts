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
