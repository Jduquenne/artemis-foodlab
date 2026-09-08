import { RecipeKind, Unit, IngredientCategory, Preparation, MealType } from "./types";
import { CATEGORIES } from "./categories";

export interface DraftIngredient {
  id: string;
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

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  recipeNumber: "",
  name: "",
  categoryId: CATEGORIES[0]?.id ?? "",
  kind: RecipeKind.DISH,
  mealTypes: [MealType.LUNCH, MealType.DINNER],
  defaultPortions: 4,
  isDessert: false,
  batchCooking: false,
  fromBook: false,
  bookPage: null,
  ingredients: [],
  instructions: [],
});
