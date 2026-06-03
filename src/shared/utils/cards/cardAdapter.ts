import { RecipeDetails, Macronutrients, Unit, IngredientCategory, Preparation } from "../../../core/domain/types";
import { DraftIngredient } from "../../../core/domain/recipeBuilderTypes";
import { formatIngredientsForIngredientCard } from "../../../core/logic/recipeBuilder/recipeBuilderLogic";
import { getCardColors } from "./cardColors";
import { buildFoodQuantityLabel } from "./cardUtils";
import { typedInstructionsDb } from "../../../core/typed-db/typedInstructionsDb";
import {
  SmallCardData,
  IngredientsCardData,
  RecetteCardData,
  RecetteBookCardData,
  FoodCardData,
} from "../../../core/domain/cardTypes";

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
    unit: ing.unit as Unit,
    preparation: (ing.preparation ?? "") as Preparation | "",
    category: (ing.category as IngredientCategory) ?? IngredientCategory.UNKNOWN,
  }));
}

export function recipeToPhotoCardData(
  recipeId: string,
  recipe: RecipeDetails,
  macros: Macronutrients | null,
): SmallCardData {
  const m = macros ?? { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };
  return {
    imageHref: recipe.assets.mealPhoto?.url ?? "",
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    fibres: Math.round(m.fibers),
    glucides: Math.round(m.carbohydrates),
    lipides: Math.round(m.lipids),
    proteines: Math.round(m.proteins),
    kcal: Math.round(m.kcal),
    colors: getCardColors(recipe.categoryId),
  };
}

export function recipeToFoodCardData(
  recipe: RecipeDetails,
  macros: Macronutrients | null,
): FoodCardData {
  const m = macros ?? { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };
  const ing = recipe.ingredients[0];
  const quantitySuffix =
    ing?.quantity != null && ing?.unit
      ? ` - ${buildFoodQuantityLabel(ing.quantity, ing.unit)}`
      : '';
  return {
    imageHref: recipe.assets.mealPhoto?.url ?? "",
    foodLabel: recipe.name + quantitySuffix,
    fibres: Math.round(m.fibers),
    glucides: Math.round(m.carbohydrates),
    lipides: Math.round(m.lipids),
    proteines: Math.round(m.proteins),
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
): RecetteCardData {
  return {
    imageHref: recipe.assets.mealPhoto?.url ?? "",
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    portions: recipe.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(ingredientsToDraft(recipe)),
    instructions: typedInstructionsDb[recipeId]?.instructions.split("\n") ?? [],
    colors: getCardColors(recipe.categoryId),
  };
}

export function recipeToBookCardData(
  recipeId: string,
  recipe: RecipeDetails,
): RecetteBookCardData {
  return {
    imageHref: recipe.assets.mealPhoto?.url ?? "",
    bookImageHref: recipe.assets.bookPhoto?.url ?? "",
    recipeName: recipe.name,
    recipeNumber: extractRecipeNumber(recipeId),
    portions: recipe.defaultPortions,
    ingredients: formatIngredientsForIngredientCard(ingredientsToDraft(recipe)),
    pageNumber: recipe.bookPage ?? 0,
    colors: getCardColors(recipe.categoryId),
  };
}
