import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { RecipeKind } from "../../domain/recipe";

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  sourceCode: null,
  recipeNumber: "",
  name: "",
  categoryId: "",
  kind: RecipeKind.DISH,
  mealTypes: [],
  defaultPortions: 2,
  isDessert: false,
  batchCooking: false,
  isFromBook: false,
  bookPage: null,
  ingredients: [],
  instructions: [],
});
