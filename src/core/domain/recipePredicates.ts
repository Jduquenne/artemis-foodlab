import { Category } from "./recipe";
import { MAX_DESSERTS_PER_SLOT, MAX_RECIPES_PER_SLOT } from "./planningConfig";
import { MealSlot } from "./planning";
import { PlannableItem, RecipeDetails, RecipeKind } from "./recipe";

const NON_BROWSABLE_CATEGORY_IDS: readonly string[] = ["outdoor", "sweet-grocery"];
const COOKED_WEIGHT_CATEGORY_IDS: readonly string[] = ["bases", "cereal-products", "pastries"];

export function supportsCookedWeight(recipe: { categoryId?: string } | undefined): boolean {
  return !!recipe?.categoryId && COOKED_WEIGHT_CATEGORY_IDS.includes(recipe.categoryId);
}

export function isDessert(recipe: Pick<RecipeDetails, "isDessert"> | undefined): boolean {
  return recipe?.isDessert === true;
}

export function isBatchCookable(recipe: Pick<RecipeDetails, "batchCooking"> | undefined): boolean {
  return recipe?.batchCooking === true;
}

export function isDish(recipe: Pick<RecipeDetails, "kind"> | undefined): boolean {
  return recipe?.kind === RecipeKind.DISH;
}

export function isIngredient(recipe: Pick<RecipeDetails, "kind"> | undefined): boolean {
  return recipe?.kind === RecipeKind.INGREDIENT;
}

export function isBase(recipe: Pick<RecipeDetails, "kind"> | undefined): boolean {
  return recipe?.kind === RecipeKind.BASE;
}

export function isOutdoor(recipe: Pick<PlannableItem, "categoryId"> | undefined): boolean {
  return recipe?.categoryId === "outdoor";
}

export function plannableRecipe(item: PlannableItem | undefined): RecipeDetails | undefined {
  return item?.source === "recipe" ? item : undefined;
}

export function isRecipeCategory(category: Pick<Category, "id">): boolean {
  return category.id !== "outdoor";
}

export function isBrowsableCategory(category: Pick<Category, "id">): boolean {
  return !NON_BROWSABLE_CATEGORY_IDS.includes(category.id);
}

export function isPlannable(recipe: Pick<RecipeDetails, "kind"> | undefined): boolean {
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
