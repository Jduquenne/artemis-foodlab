import { RecipeKind, Unit, IngredientCategory, Preparation, MealType } from "./types";

export interface DraftIngredient {
  id: string;
  apiId?: string;
  ingredientType: "food" | "base";
  name: string;
  foodId?: string;
  baseId?: string;
  quantity: number | null;
  unit: Unit;
  preparation: Preparation | "";
  category: IngredientCategory;
}

export interface RecipeBuilderState {
  recipeNumber: string;
  name: string;
  categoryId: string;
  kind: RecipeKind;
  mealTypes: MealType[];
  defaultPortions: number;
  isDessert: boolean;
  batchCooking: boolean;
  fromBook: boolean;
  bookPage: number | null;
  ingredients: DraftIngredient[];
  instructions: string[];
}
