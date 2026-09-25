import { MealType, RecipeKind } from "./recipe";

export const RECIPE_KIND_LABELS: Record<RecipeKind, string> = {
  [RecipeKind.DISH]: "Plat",
  [RecipeKind.INGREDIENT]: "Ingrédient",
  [RecipeKind.BASE]: "Base",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Matin",
  [MealType.LUNCH]: "Midi",
  [MealType.DINNER]: "Soir",
  [MealType.SNACK]: "En-cas",
};
