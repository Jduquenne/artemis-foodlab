import { RecipeKind, Unit, IngredientCategory, Preparation } from "./types";
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
  mealTypes: "meal" | "side";
  defaultPortions: number;
  isDessert: boolean;
  batchCooking: boolean;
  ingredients: DraftIngredient[];
}

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  recipeNumber: "",
  name: "",
  categoryId: CATEGORIES[0].id,
  kind: RecipeKind.DISH,
  mealTypes: "meal",
  defaultPortions: 4,
  isDessert: false,
  batchCooking: false,
  ingredients: [],
});
