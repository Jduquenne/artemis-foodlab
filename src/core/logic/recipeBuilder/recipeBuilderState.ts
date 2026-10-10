import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { MealType, RecipeKind } from "../../domain/recipe";

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  sourceCode: null,
  recipeNumber: "",
  name: "",
  categoryId: "",
  kind: RecipeKind.DISH,
  mealTypes: [MealType.LUNCH, MealType.DINNER],
  defaultPortions: 2,
  isDessert: false,
  batchCooking: false,
  isFromBook: false,
  bookPage: null,
  ingredients: [],
  instructions: [],
});
