import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { MealType, RecipeKind } from "../../domain/recipe";
import { categoriesCatalogue } from "../../catalogue/categories";

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  recipeNumber: "",
  name: "",
  categoryId: categoriesCatalogue[0]?.id ?? "",
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
