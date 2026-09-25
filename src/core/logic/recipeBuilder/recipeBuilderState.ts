import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { MealType, RecipeKind } from "../../domain/types";
import { typedCategoriesDb } from "../../typed-db/typedCategoriesDb";

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  recipeNumber: "",
  name: "",
  categoryId: typedCategoriesDb[0]?.id ?? "",
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
