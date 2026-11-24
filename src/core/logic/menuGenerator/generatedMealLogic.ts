import { GeneratedMeal } from "../../domain/menuGenerator";

export function generatedRecipeCode(meal: GeneratedMeal): string | null {
  return meal.kind === "recipe" ? meal.recipeCode : null;
}

export function generatedMealCodes(meal: GeneratedMeal, existing: Record<string, string[]>): string[] {
  switch (meal.kind) {
    case "kept":
      return existing[meal.key] ?? [];
    case "recipe":
      return [meal.recipeCode];
    case "empty":
    case "noMeal":
      return [];
  }
}
