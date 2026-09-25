import { IngredientCategory } from "../../../core/domain/ingredient";
import { Macronutrients } from "../../../core/domain/nutrition";
import { RecipeDetails } from "../../../core/domain/recipe";
import { DraftIngredient, RecipeBuilderState } from "../../../core/domain/recipeBuilderTypes";
import { formatIngredientsForIngredientCard } from "./ingredientLines";
import { getCardColors } from "./cardColors";
import { buildFoodQuantityLabel } from "./cardUtils";
import {
  SmallCardData,
  IngredientsCardData,
  RecetteCardData,
  RecetteBookCardData,
  FoodCardData,
} from "./cardTypes";

function extractRecipeNumber(recipeId: string): number {
  return parseInt(recipeId.replace(/^[a-z]+-/, ""), 10);
}

function ingredientsToDraft(recipe: Pick<RecipeDetails, "ingredients">): DraftIngredient[] {
  return recipe.ingredients.map((ing) => ({
    id: ing.id,
    ingredientType: ing.baseId ? ("base" as const) : ("food" as const),
    name: ing.name,
    foodId: ing.foodId,
    baseId: ing.baseId,
    quantity: ing.quantity,
    unit: ing.unit,
    preparation: ing.preparation ?? "",
    category: (ing.category as IngredientCategory) ?? IngredientCategory.UNKNOWN,
  }));
}

export function recipeToPhotoCardData(
  recipeId: string,
  recipe: RecipeDetails,
  macros: Macronutrients | null,
  imageHref: string = recipe.assets.mealPhoto?.url ?? "",
): SmallCardData {
  const m = macros ?? { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };
  return {
    imageHref,
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    fibers: Math.round(m.fibers),
    carbohydrates: Math.round(m.carbohydrates),
    lipids: Math.round(m.lipids),
    proteins: Math.round(m.proteins),
    kcal: Math.round(m.kcal),
    colors: getCardColors(recipe.categoryId),
  };
}

export function recipeToFoodCardData(
  recipe: RecipeDetails,
  macros: Macronutrients | null,
  imageHref: string = recipe.assets.mealPhoto?.url ?? "",
): FoodCardData {
  const m = macros ?? { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };
  const ing = recipe.ingredients[0];
  const quantitySuffix =
    ing?.quantity != null && ing?.unit
      ? ` - ${buildFoodQuantityLabel(ing.quantity, ing.unit)}`
      : '';
  return {
    imageHref,
    foodLabel: recipe.name + quantitySuffix,
    fibers: Math.round(m.fibers),
    carbohydrates: Math.round(m.carbohydrates),
    lipids: Math.round(m.lipids),
    proteins: Math.round(m.proteins),
    kcal: Math.round(m.kcal),
    colors: getCardColors(recipe.categoryId),
  };
}

export function recipeToIngredientsCardData(
  recipeId: string,
  recipe: RecipeDetails,
): IngredientsCardData {
  return {
    recipeNumber: extractRecipeNumber(recipeId),
    portions: recipe.defaultPortions,
    ingredientLines: formatIngredientsForIngredientCard(ingredientsToDraft(recipe)),
    colors: getCardColors(recipe.categoryId),
  };
}

export function recipeToRecetteCardData(
  recipeId: string,
  recipe: RecipeDetails,
  imageHref: string = recipe.assets.mealPhoto?.url ?? "",
): RecetteCardData {
  return {
    imageHref,
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    portions: recipe.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(ingredientsToDraft(recipe)),
    instructions: recipe.instructions?.split("\n") ?? [],
    colors: getCardColors(recipe.categoryId),
  };
}

export function builderStateToRecetteCardData(
  state: RecipeBuilderState,
  imageHref: string,
): RecetteCardData {
  return {
    imageHref,
    recipeName: state.name,
    recipeNumber: parseInt(state.recipeNumber, 10) || 0,
    portions: state.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(state.ingredients),
    instructions: state.instructions,
    colors: getCardColors(state.categoryId),
  };
}

export function builderStateToBookCardData(
  state: RecipeBuilderState,
  imageHref: string,
  bookImageHref: string,
): RecetteBookCardData {
  return {
    imageHref,
    bookImageHref,
    recipeName: state.name,
    recipeNumber: parseInt(state.recipeNumber, 10) || 0,
    portions: state.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(state.ingredients),
    pageNumber: state.bookPage ?? 0,
    colors: getCardColors(state.categoryId),
  };
}

export function recipeToBookCardData(
  recipeId: string,
  recipe: RecipeDetails,
  imageHref: string = recipe.assets.mealPhoto?.url ?? "",
  bookImageHref: string = recipe.assets.bookPhoto?.url ?? "",
): RecetteBookCardData {
  return {
    imageHref,
    bookImageHref,
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    portions: recipe.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(ingredientsToDraft(recipe)),
    pageNumber: recipe.bookPage ?? 0,
    colors: getCardColors(recipe.categoryId),
  };
}
