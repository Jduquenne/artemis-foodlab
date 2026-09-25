import { Category } from "./recipe";
import { MAX_DESSERTS_PER_SLOT, MAX_RECIPES_PER_SLOT } from "./planningConfig";
import { MealSlot } from "./planning";
import { PlannableItem, RecipeKind } from "./recipe";

const NON_BROWSABLE_CATEGORY_IDS: readonly string[] = ["outdoor", "sweet-grocery"];

export function isDessert(recipe: Pick<PlannableItem, "isDessert"> | undefined | null): boolean {
  return recipe?.isDessert === true;
}

export function isBatchCookable(recipe: Pick<PlannableItem, "batchCooking"> | undefined | null): boolean {
  return recipe?.batchCooking === true;
}

export function isDish(recipe: Pick<PlannableItem, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.DISH;
}

export function isIngredient(recipe: Pick<PlannableItem, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.INGREDIENT;
}

export function isBase(recipe: Pick<PlannableItem, "kind"> | undefined | null): boolean {
  return recipe?.kind === RecipeKind.BASE;
}

export function isOutdoor(recipe: Pick<PlannableItem, "categoryId"> | undefined | null): boolean {
  return recipe?.categoryId === "outdoor";
}

export function isBrowsableCategory(category: Pick<Category, "id">): boolean {
  return !NON_BROWSABLE_CATEGORY_IDS.includes(category.id);
}

export function isPlannable(recipe: Pick<PlannableItem, "kind"> | undefined | null): boolean {
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
  return (slot.dessertIds?.length ?? 0) < MAX_DESSERTS_PER_SLOT;
}

export function isSlotFull(slot: Pick<MealSlot, "recipeIds">): boolean {
  return slot.recipeIds.length >= MAX_RECIPES_PER_SLOT;
}
