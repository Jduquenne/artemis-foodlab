import { IngredientCategory } from "../../domain/ingredient";
import { DietFilter, GeneratedSlotType, MenuGeneratorSettings, RecipeDietProfile, SeasonMode } from "../../domain/menuGenerator";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { isDessert, isOutdoor } from "../../domain/recipePredicates";
import { compareByName } from "../../utils/sortUtils";
import { foodsOfGroupSorted } from "../foodGroup/foodChoiceLogic";
import { SeasonCatalogue, isRecipeInSeason } from "../season/recipeSeasonLogic";

export type MenuCatalogue = SeasonCatalogue;

const MEAT_INGREDIENT_CATEGORIES: readonly IngredientCategory[] = [IngredientCategory.MEAT, IngredientCategory.DELI];
const FISH_INGREDIENT_CATEGORIES: readonly IngredientCategory[] = [IngredientCategory.FISH];
const MEAT_RECIPE_CATEGORY_IDS: readonly string[] = ["red-meat", "white-meat", "charcuterie"];
const FISH_RECIPE_CATEGORY_IDS: readonly string[] = ["fish"];

export function isGeneratableDish(recipe: RecipeDetails, slot: GeneratedSlotType): boolean {
  return recipe.kind === RecipeKind.DISH && !isDessert(recipe) && !isOutdoor(recipe) && recipe.mealTypes.includes(slot);
}

function collectDiet(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>, visited: Set<string>, diet: RecipeDietProfile): void {
  if (visited.has(recipe.code)) return;
  visited.add(recipe.code);
  if (MEAT_RECIPE_CATEGORY_IDS.includes(recipe.categoryId)) diet.hasMeat = true;
  if (FISH_RECIPE_CATEGORY_IDS.includes(recipe.categoryId)) diet.hasFish = true;
  for (const ingredient of recipe.ingredients) {
    if (MEAT_INGREDIENT_CATEGORIES.includes(ingredient.category)) diet.hasMeat = true;
    if (FISH_INGREDIENT_CATEGORIES.includes(ingredient.category)) diet.hasFish = true;
    const base = ingredient.baseId ? recipes[ingredient.baseId] : undefined;
    if (base) collectDiet(base, recipes, visited, diet);
  }
}

export function recipeDietProfile(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>): RecipeDietProfile {
  const diet: RecipeDietProfile = { hasMeat: false, hasFish: false };
  collectDiet(recipe, recipes, new Set(), diet);
  return diet;
}

export function matchesDiet(profile: RecipeDietProfile, diet: DietFilter): boolean {
  if (diet === "vegetarian") return !profile.hasMeat && !profile.hasFish;
  if (diet === "pescatarian") return !profile.hasMeat;
  return true;
}

function usesExcluded(recipe: RecipeDetails, excluded: ReadonlySet<string>, catalogue: MenuCatalogue, visited: Set<string>): boolean {
  if (visited.has(recipe.code)) return false;
  visited.add(recipe.code);
  return recipe.ingredients.some((ingredient) => {
    if (ingredient.foodGroupId) {
      const members = foodsOfGroupSorted(catalogue.foods, ingredient.foodGroupId);
      return members.length > 0 && members.every((food) => excluded.has(food.id));
    }
    if (ingredient.foodId) return excluded.has(ingredient.foodId);
    const base = ingredient.baseId ? catalogue.recipes[ingredient.baseId] : undefined;
    return base ? usesExcluded(base, excluded, catalogue, visited) : false;
  });
}

export function usesExcludedFood(recipe: RecipeDetails, excludedFoodIds: readonly string[], catalogue: MenuCatalogue): boolean {
  if (excludedFoodIds.length === 0) return false;
  return usesExcluded(recipe, new Set(excludedFoodIds), catalogue, new Set());
}

export function slotCandidates(
  catalogue: MenuCatalogue,
  slot: GeneratedSlotType,
  settings: Pick<MenuGeneratorSettings, "diet" | "excludedFoodIds">,
): RecipeDetails[] {
  return Object.values(catalogue.recipes)
    .filter((recipe) => isGeneratableDish(recipe, slot))
    .filter((recipe) => matchesDiet(recipeDietProfile(recipe, catalogue.recipes), settings.diet))
    .filter((recipe) => !usesExcludedFood(recipe, settings.excludedFoodIds, catalogue))
    .sort(compareByName);
}

export function seasonAllows(recipe: RecipeDetails, month: number, mode: SeasonMode, catalogue: MenuCatalogue): boolean {
  return mode !== "strict" || isRecipeInSeason(recipe, month, catalogue);
}

export function dayCandidates(
  candidates: readonly RecipeDetails[],
  month: number,
  mode: SeasonMode,
  catalogue: MenuCatalogue,
): RecipeDetails[] {
  return candidates.filter((recipe) => seasonAllows(recipe, month, mode, catalogue));
}
