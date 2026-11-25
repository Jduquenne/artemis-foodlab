import { DietFilter, GeneratedSlotType, MenuGeneratorSettings, RecipeDietProfile, SeasonMode } from "../../domain/menuGenerator";
import { RecipeDetails, RecipeKind } from "../../domain/recipe";
import { isDessert, isOutdoor } from "../../domain/recipePredicates";
import { compareByName } from "../../utils/sortUtils";
import { foodsOfGroupSorted } from "../foodGroup/foodChoiceLogic";
import { SeasonCatalogue, isRecipeInSeason } from "../season/recipeSeasonLogic";

export type MenuCatalogue = SeasonCatalogue;

const RED_MEAT_CATEGORY_ID = "red-meat";
const WHITE_MEAT_CATEGORY_ID = "white-meat";
const DELI_CATEGORY_ID = "charcuterie";
const MEAT_RECIPE_CATEGORY_IDS: readonly string[] = [RED_MEAT_CATEGORY_ID, WHITE_MEAT_CATEGORY_ID, DELI_CATEGORY_ID];
const FISH_RECIPE_CATEGORY_IDS: readonly string[] = ["fish"];

export function isGeneratableDish(recipe: RecipeDetails, slot: GeneratedSlotType): boolean {
  return recipe.kind === RecipeKind.DISH && !isDessert(recipe) && !isOutdoor(recipe) && recipe.mealTypes.includes(slot);
}

function collectDiet(recipe: RecipeDetails, catalogue: MenuCatalogue, visited: Set<string>, diet: RecipeDietProfile): void {
  if (visited.has(recipe.code)) return;
  visited.add(recipe.code);
  if (MEAT_RECIPE_CATEGORY_IDS.includes(recipe.categoryId)) diet.hasMeat = true;
  if (FISH_RECIPE_CATEGORY_IDS.includes(recipe.categoryId)) diet.hasFish = true;
  if (recipe.categoryId === RED_MEAT_CATEGORY_ID) diet.hasRedMeat = true;
  if (recipe.categoryId === WHITE_MEAT_CATEGORY_ID) diet.hasWhiteMeat = true;
  if (recipe.categoryId === DELI_CATEGORY_ID) diet.hasDeli = true;
  for (const ingredient of recipe.ingredients) {
    if (ingredient.link === "food") {
      const origin = catalogue.foods[ingredient.foodId]?.origin;
      if (origin === "meat" || origin === "deli") diet.hasMeat = true;
      if (origin === "deli") diet.hasDeli = true;
      if (origin === "fish") diet.hasFish = true;
    }
    const base = ingredient.link === "base" ? catalogue.recipes[ingredient.baseId] : undefined;
    if (base) collectDiet(base, catalogue, visited, diet);
  }
}

export function recipeDietProfile(recipe: RecipeDetails, catalogue: MenuCatalogue): RecipeDietProfile {
  const diet: RecipeDietProfile = { hasMeat: false, hasFish: false, hasRedMeat: false, hasWhiteMeat: false, hasDeli: false };
  collectDiet(recipe, catalogue, new Set(), diet);
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
    if (ingredient.link === "free") return false;
    if (ingredient.link === "base") {
      const base = catalogue.recipes[ingredient.baseId];
      return base ? usesExcluded(base, excluded, catalogue, visited) : false;
    }
    if (ingredient.foodGroupId !== null) {
      const members = foodsOfGroupSorted(catalogue.foods, ingredient.foodGroupId);
      return members.length > 0 && members.every((food) => excluded.has(food.id));
    }
    return excluded.has(ingredient.foodId);
  });
}

export function usesExcludedFood(recipe: RecipeDetails, excludedFoodIds: readonly string[], catalogue: MenuCatalogue): boolean {
  if (excludedFoodIds.length === 0) return false;
  return usesExcluded(recipe, new Set(excludedFoodIds), catalogue, new Set());
}

export function slotCandidates(
  catalogue: MenuCatalogue,
  slot: GeneratedSlotType,
  settings: Pick<MenuGeneratorSettings, "diet" | "excludedFoodIds" | "bannedRecipeCodes">,
): RecipeDetails[] {
  return Object.values(catalogue.recipes)
    .filter((recipe) => isGeneratableDish(recipe, slot))
    .filter((recipe) => !settings.bannedRecipeCodes.includes(recipe.code))
    .filter((recipe) => matchesDiet(recipeDietProfile(recipe, catalogue), settings.diet))
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
