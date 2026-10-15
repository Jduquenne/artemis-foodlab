import { Food, IngredientCategory, Unit } from "../../domain/ingredient";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { DraftIngredient, RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";
import { getIdByCode } from "../../catalogue/recipeIdMap";
import { ApiIngredientInput, ApiRecipeInput } from "../recipe/recipeApiMapper";
import { getBuilderRecipeCode } from "./recipeCodeLogic";
import { isUnit } from "../unit/unitLogic";

export function switchIngredientType(
  ing: DraftIngredient,
  type: "food" | "base",
): DraftIngredient {
  return {
    ...ing,
    ingredientType: type,
    name: "",
    foodId: undefined,
    baseId: undefined,
    foodGroupId: undefined,
    quantity: null,
    unit: type === "base" ? Unit.PORTION : Unit.NONE,
    preparation: "",
    category: type === "base" ? IngredientCategory.RECIPE : IngredientCategory.FRUIT_VEGETABLE,
  };
}

export function applyFoodPick(ingredient: DraftIngredient, name: string, food?: Food): DraftIngredient {
  const keepsGroup = Boolean(food?.groupId) && food?.groupId === ingredient.foodGroupId;
  const unit = food?.unit;
  return {
    ...ingredient,
    name,
    foodId: food?.id,
    category: food?.category ?? ingredient.category,
    unit: isUnit(unit) ? unit : ingredient.unit,
    foodGroupId: keepsGroup ? ingredient.foodGroupId : undefined,
  };
}

export function toggleFoodChoice(ingredient: DraftIngredient, food: Food | undefined): DraftIngredient {
  if (ingredient.foodGroupId) return { ...ingredient, foodGroupId: undefined };
  if (!food?.groupId || food.id !== ingredient.foodId) return ingredient;
  return { ...ingredient, foodGroupId: food.groupId };
}

export function recipeToBuilderState(
  recipeId: string,
  recipe: RecipeDetails,
): RecipeBuilderState {
  const recipeNumber = recipeId.replace(/^[a-z]+-/, "");
  const ingredients: DraftIngredient[] = recipe.ingredients.map((ing) => ({
    id: ing.id,
    apiId: ing.id,
    ingredientType: ing.baseId ? "base" : "food",
    name: ing.name,
    foodId: ing.foodId,
    baseId: ing.baseId,
    foodGroupId: ing.foodGroupId,
    quantity: ing.quantity,
    unit: ing.unit,
    preparation: ing.preparation ?? "",
    category: (ing.category as IngredientCategory) ?? IngredientCategory.UNKNOWN,
  }));
  return {
    sourceCode: recipeId,
    recipeNumber,
    name: recipe.name,
    categoryId: recipe.categoryId,
    kind: recipe.kind,
    mealTypes: recipe.mealTypes ?? [],
    defaultPortions: recipe.defaultPortions,
    isDessert: recipe.isDessert ?? false,
    batchCooking: recipe.batchCooking ?? false,
    isFromBook: recipe.isFromBook ?? false,
    bookPage: recipe.bookPage ?? null,
    ingredients,
    instructions: recipe.instructions?.split("\n") ?? [],
  };
}

export function builderStateToApiBody(state: RecipeBuilderState): ApiRecipeInput {
  const isBaseKind = state.kind === RecipeKind.BASE;
  const ingredients: ApiIngredientInput[] = state.ingredients
    .filter((ing) => ing.name.trim())
    .map((ing) => {
      const isBaseIngredient = ing.ingredientType === "base";
      return {
        ...(ing.apiId ? { id: ing.apiId } : {}),
        name: ing.name.trim(),
        categoryId: getIngredientCategoryId(ing.category) ?? "",
        foodId: !isBaseIngredient ? (ing.foodId ?? null) : null,
        baseId: isBaseIngredient && ing.baseId ? (getIdByCode(ing.baseId) ?? null) : null,
        foodGroupId: !isBaseIngredient && ing.foodId ? (ing.foodGroupId ?? null) : null,
        quantity: ing.quantity,
        unit: ing.unit === Unit.NONE ? null : ing.unit,
        preparation: ing.preparation || null,
      };
    });

  return {
    code: getBuilderRecipeCode(state),
    name: state.name.trim(),
    categoryId: state.categoryId,
    kind: state.kind,
    mealTypes: isBaseKind ? [] : state.mealTypes,
    defaultPortions: state.defaultPortions,
    batchCooking: state.batchCooking,
    isDessert: isBaseKind ? false : state.isDessert,
    isFromBook: state.isFromBook,
    bookPage: state.isFromBook ? state.bookPage : null,
    instructions:
      state.instructions.map((line) => line.trim()).filter(Boolean).join("\n") || null,
    ingredients,
  };
}
