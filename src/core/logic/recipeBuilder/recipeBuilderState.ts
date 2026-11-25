import { DraftIngredient, DraftIngredientCommon, RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { IngredientCategory, Unit } from "../../domain/ingredient";
import { RecipeKind } from "../../domain/recipe";

export function hasOwnCategory(ingredient: DraftIngredient): boolean {
  return ingredient.ingredientType === "food" && ingredient.foodId === null;
}

export const emptyDraftIngredientCommon = (): DraftIngredientCommon => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: null,
  unit: Unit.NONE,
  preparation: "",
  category: IngredientCategory.FRUIT_VEGETABLE,
});

export const emptyDraftIngredient = (): DraftIngredient => ({
  ...emptyDraftIngredientCommon(),
  ingredientType: "food",
  foodId: null,
  foodGroupId: null,
});

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  sourceCode: null,
  recipeNumber: "",
  name: "",
  categoryId: "",
  kind: RecipeKind.DISH,
  mealTypes: [],
  defaultPortions: 2,
  portionsPerPerson: 1,
  cookedWeightGrams: null,
  isDessert: false,
  batchCooking: false,
  isFromBook: false,
  bookPage: null,
  ingredients: [],
  instructions: [],
  industrialEquivalent: null,
});
