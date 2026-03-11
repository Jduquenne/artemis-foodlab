import { MealSlot, RecipeDetails, RecipeKind } from "./types";

export function isDessert(recipe: Pick<RecipeDetails, "isDessert"> | undefined | null): boolean {
  return recipe?.isDessert === true;
}

export function isBatchCookable(recipe: Pick<RecipeDetails, "batchCooking"> | undefined | null): boolean {
  return recipe?.batchCooking === true;
}

export function isDish(recipe: Pick<RecipeDetails, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.DISH;
}

export function isIngredient(recipe: Pick<RecipeDetails, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.INGREDIENT;
}

export function isBase(recipe: Pick<RecipeDetails, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.BASE;
}

export function isOutdoor(recipe: Pick<RecipeDetails, "categoryId"> | undefined | null): boolean {
  return recipe?.categoryId === "outdoor";
}

export function isPlannable(recipe: Pick<RecipeDetails, "kind"> | undefined | null): boolean {
  return !isBase(recipe);
}

export function getAllRecipeIds(slot: MealSlot): string[] {
  return [...slot.recipeIds, ...(slot.dessertIds ?? [])];
}

export function hasRecipes(slot: Pick<MealSlot, "recipeIds">): boolean {
  return slot.recipeIds.length > 0;
}

export function hasDesserts(slot: Pick<MealSlot, "dessertIds">): boolean {
  return (slot.dessertIds?.length ?? 0) > 0;
}

export function canAddDessert(slot: Pick<MealSlot, "dessertIds">): boolean {
  return (slot.dessertIds?.length ?? 0) < 3;
}

export function isSlotFull(slot: Pick<MealSlot, "recipeIds">): boolean {
  return slot.recipeIds.length >= 4;
}
