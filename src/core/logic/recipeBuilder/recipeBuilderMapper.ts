import { Food, Ingredient, IngredientCategory, Unit } from "../../domain/ingredient";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { DraftIngredient, RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";
import { getIdByCode } from "../../catalogue/recipeIdMap";
import { ApiIngredientInput, ApiRecipeInput } from "../recipe/recipeApiMapper";
import { getBuilderRecipeCode } from "./recipeCodeLogic";
import { isUnit } from "../unit/unitLogic";
import { industrialDraftFromRecipe, industrialDraftToApi } from "./industrialEquivalentLogic";
import { portionsPerPersonToApi } from "./portionsPerPersonLogic";
import { cookedWeightToApi } from "./cookedWeightLogic";
import { portionsPerPersonOf } from "../recipe/portionsPerPersonLogic";

export function switchIngredientType(
  ing: DraftIngredient,
  type: "food" | "base",
): DraftIngredient {
  const common = { id: ing.id, ...(ing.apiId ? { apiId: ing.apiId } : {}), name: "", quantity: null, preparation: "" };
  return type === "base"
    ? { ...common, ingredientType: "base", baseId: null, unit: Unit.PORTION, category: IngredientCategory.RECIPE }
    : { ...common, ingredientType: "food", foodId: null, foodGroupId: null, unit: Unit.NONE, category: IngredientCategory.FRUIT_VEGETABLE };
}

export function applyFoodPick(ingredient: DraftIngredient, name: string, food?: Food): DraftIngredient {
  if (ingredient.ingredientType !== "food") return ingredient;
  const keepsGroup = Boolean(food?.groupId) && food?.groupId === ingredient.foodGroupId;
  const unit = food?.unit ?? null;
  return {
    ...ingredient,
    name,
    foodId: food?.id ?? null,
    category: food?.category ?? ingredient.category,
    unit: isUnit(unit) ? unit : ingredient.unit,
    foodGroupId: keepsGroup ? ingredient.foodGroupId : null,
  };
}

export function applyBasePick(ingredient: DraftIngredient, name: string, baseId: string): DraftIngredient {
  return ingredient.ingredientType === "base" ? { ...ingredient, name, baseId } : ingredient;
}

export function toggleFoodChoice(ingredient: DraftIngredient, food: Food | undefined): DraftIngredient {
  if (ingredient.ingredientType !== "food") return ingredient;
  if (ingredient.foodGroupId) return { ...ingredient, foodGroupId: null };
  if (!food?.groupId || food.id !== ingredient.foodId) return ingredient;
  return { ...ingredient, foodGroupId: food.groupId };
}

export function draftIngredientFromRecipe(ing: Ingredient): DraftIngredient {
  const common = {
    id: ing.id,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    preparation: ing.preparation ?? "",
    category: ing.category,
  };
  switch (ing.link) {
    case "base":
      return { ...common, ingredientType: "base", baseId: ing.baseId };
    case "food":
      return { ...common, ingredientType: "food", foodId: ing.foodId, foodGroupId: ing.foodGroupId };
    case "free":
      return { ...common, ingredientType: "food", foodId: null, foodGroupId: null };
  }
}

export function recipeToBuilderState(
  recipeId: string,
  recipe: RecipeDetails,
): RecipeBuilderState {
  const recipeNumber = recipeId.replace(/^[a-z]+-/, "");
  const ingredients = recipe.ingredients.map((ing): DraftIngredient => ({ ...draftIngredientFromRecipe(ing), apiId: ing.id }));
  return {
    sourceCode: recipeId,
    recipeNumber,
    name: recipe.name,
    categoryId: recipe.categoryId,
    kind: recipe.kind,
    mealTypes: recipe.mealTypes ?? [],
    defaultPortions: recipe.defaultPortions,
    portionsPerPerson: portionsPerPersonOf(recipe),
    cookedWeightGrams: recipe.cookedWeightGrams ?? null,
    isDessert: recipe.isDessert ?? false,
    batchCooking: recipe.batchCooking ?? false,
    isFromBook: recipe.isFromBook ?? false,
    bookPage: recipe.bookPage ?? null,
    ingredients,
    instructions: recipe.instructions?.split("\n") ?? [],
    industrialEquivalent: industrialDraftFromRecipe(recipe.industrialEquivalent),
  };
}

export function builderStateToApiBody(state: RecipeBuilderState): ApiRecipeInput {
  const isBaseKind = state.kind === RecipeKind.BASE;
  const ingredients: ApiIngredientInput[] = state.ingredients
    .filter((ing) => ing.name.trim())
    .map((ing) => {
      return {
        ...(ing.apiId ? { id: ing.apiId } : {}),
        name: ing.name.trim(),
        categoryId: getIngredientCategoryId(ing.category) ?? "",
        foodId: ing.ingredientType === "food" ? ing.foodId : null,
        baseId: ing.ingredientType === "base" && ing.baseId ? (getIdByCode(ing.baseId) ?? null) : null,
        foodGroupId: ing.ingredientType === "food" && ing.foodId ? ing.foodGroupId : null,
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
    portionsPerPerson: portionsPerPersonToApi(state.portionsPerPerson, state.kind),
    cookedWeightGrams: cookedWeightToApi(state.cookedWeightGrams, state.categoryId),
    batchCooking: state.batchCooking,
    isDessert: isBaseKind ? false : state.isDessert,
    isFromBook: state.isFromBook,
    bookPage: state.isFromBook ? state.bookPage : null,
    instructions:
      state.instructions.map((line) => line.trim()).filter(Boolean).join("\n") || null,
    industrialEquivalent: industrialDraftToApi(state.industrialEquivalent, isBaseKind),
    ingredients,
  };
}
