import { FoodChoice, FoodGroupDefault, ResolvedFood } from "../../domain/foodGroup";
import { Food, Ingredient } from "../../domain/ingredient";
import { Profile } from "../../domain/profile";
import { RecipeDetails } from "../../domain/recipe";
import { compareByName } from "../../utils/sortUtils";

export type FoodChoiceStatus = "none" | "partial" | "complete";

export type FoodChoicesByCode = Record<string, FoodChoice[]>;

export interface FoodPersonalization {
  profile: Pick<Profile, "id" | "foodGroupDefaults">;
  mealChoices: readonly FoodChoice[];
}

export interface FoodChoiceShare {
  foodId: string;
  quantity: number;
  byRecipeDefault: boolean;
  profileIds: string[];
}

export function findMealChoice(
  choices: readonly FoodChoice[],
  recipeIngredientId: string,
  profileId: string,
): FoodChoice | undefined {
  return choices.find((c) => c.recipeIngredientId === recipeIngredientId && c.profileId === profileId);
}

export function resolveIngredientFood(
  ingredient: Ingredient,
  profileId: string,
  profileDefaults: readonly FoodGroupDefault[],
  mealChoices: readonly FoodChoice[],
): ResolvedFood | null {
  if (!ingredient.foodId) return null;
  if (!ingredient.foodGroupId) return { foodId: ingredient.foodId, source: "recipe", quantityPerPortion: null };

  const choice = findMealChoice(mealChoices, ingredient.id, profileId);
  if (choice) return { foodId: choice.foodId, source: "meal", quantityPerPortion: choice.quantity ?? null };

  const profileDefault = profileDefaults.find((d) => d.foodGroupId === ingredient.foodGroupId);
  if (profileDefault) return { foodId: profileDefault.foodId, source: "profile", quantityPerPortion: null };

  return { foodId: ingredient.foodId, source: "recipe", quantityPerPortion: null };
}

export function groupIngredientsOf(recipe: { ingredients: Ingredient[] } | undefined): Ingredient[] {
  return (recipe?.ingredients ?? []).filter((ing) => Boolean(ing.foodGroupId && ing.foodId && !ing.baseId));
}

export function foodsOfGroupSorted(foods: Record<string, Food>, groupId: string): Food[] {
  return Object.values(foods).filter((food) => food.groupId === groupId).sort(compareByName);
}

export function foodChoiceStatus(
  ingredients: readonly Ingredient[],
  profiles: readonly Pick<Profile, "id" | "foodGroupDefaults">[],
  mealChoices: readonly FoodChoice[],
): FoodChoiceStatus {
  const total = ingredients.length * profiles.length;
  if (total === 0) return "complete";
  let chosen = 0;
  for (const ingredient of ingredients) {
    for (const profile of profiles) {
      const resolved = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, mealChoices);
      if (resolved && resolved.source !== "recipe") chosen += 1;
    }
  }
  if (chosen === 0) return "none";
  return chosen === total ? "complete" : "partial";
}

export function setMealFoodChoice(
  choices: readonly FoodChoice[],
  recipeIngredientId: string,
  profileId: string,
  foodId: string | null,
): FoodChoice[] {
  const current = findMealChoice(choices, recipeIngredientId, profileId);
  const others = choices.filter((c) => c !== current);
  return foodId ? [...others, { recipeIngredientId, profileId, foodId, quantity: current?.quantity ?? null }] : others;
}

export function setMealFoodQuantity(
  choices: readonly FoodChoice[],
  recipeIngredientId: string,
  profileId: string,
  quantity: number | null,
): FoodChoice[] {
  const normalized = quantity !== null && quantity > 0 ? quantity : null;
  return choices.map((c) =>
    c.recipeIngredientId === recipeIngredientId && c.profileId === profileId ? { ...c, quantity: normalized } : c,
  );
}

export function recipeQuantityPerPortion(ingredient: Ingredient, defaultPortions: number): number | null {
  if (ingredient.quantity === null) return null;
  return ingredient.quantity / Math.max(defaultPortions, 1);
}

export function splitGroupIngredient(
  ingredient: Ingredient,
  defaultPortions: number,
  scaleFactor: number,
  profiles: readonly Pick<Profile, "id" | "foodGroupDefaults">[],
  mealChoices: readonly FoodChoice[],
): FoodChoiceShare[] {
  const recipePerPortion = recipeQuantityPerPortion(ingredient, defaultPortions) ?? 0;
  const portions = scaleFactor * Math.max(defaultPortions, 1);
  if (!ingredient.foodId) return [];
  if (profiles.length === 0) {
    return [{ foodId: ingredient.foodId, quantity: recipePerPortion * portions, byRecipeDefault: true, profileIds: [] }];
  }
  const portionsPerProfile = portions / profiles.length;
  const shares = new Map<string, FoodChoiceShare>();
  for (const profile of profiles) {
    const resolved = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, mealChoices);
    if (!resolved) continue;
    const quantity = (resolved.quantityPerPortion ?? recipePerPortion) * portionsPerProfile;
    const byRecipeDefault = resolved.source === "recipe";
    const existing = shares.get(resolved.foodId);
    if (existing) {
      existing.quantity += quantity;
      existing.byRecipeDefault = existing.byRecipeDefault || byRecipeDefault;
      existing.profileIds.push(profile.id);
    } else {
      shares.set(resolved.foodId, { foodId: resolved.foodId, quantity, byRecipeDefault, profileIds: [profile.id] });
    }
  }
  return [...shares.values()];
}

export function personalizeRecipe(
  recipe: RecipeDetails,
  personalization: FoodPersonalization,
  foods: Record<string, Food>,
): RecipeDetails {
  const { profile, mealChoices } = personalization;
  let changed = false;
  const ingredients = recipe.ingredients.map((ingredient) => {
    if (!ingredient.foodGroupId) return ingredient;
    const resolved = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, mealChoices);
    if (!resolved) return ingredient;
    const quantity =
      resolved.quantityPerPortion !== null ? resolved.quantityPerPortion * recipe.defaultPortions : ingredient.quantity;
    if (resolved.foodId === ingredient.foodId && quantity === ingredient.quantity) return ingredient;
    changed = true;
    return { ...ingredient, foodId: resolved.foodId, name: foods[resolved.foodId]?.name ?? ingredient.name, quantity };
  });
  return changed ? { ...recipe, ingredients } : recipe;
}

function choiceKey(choice: FoodChoice): string {
  return `${choice.recipeIngredientId}|${choice.profileId}|${choice.foodId}|${choice.quantity ?? ""}`;
}

export function sameFoodChoices(a: readonly FoodChoice[] | undefined, b: readonly FoodChoice[] | undefined): boolean {
  const left = (a ?? []).map(choiceKey).sort();
  const right = (b ?? []).map(choiceKey).sort();
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function withFoodChoices(
  record: FoodChoicesByCode | undefined,
  code: string,
  choices: FoodChoice[],
): FoodChoicesByCode | undefined {
  const next = { ...record };
  if (choices.length > 0) next[code] = choices;
  else delete next[code];
  return Object.keys(next).length > 0 ? next : undefined;
}

export function pickFoodChoices(
  sources: readonly (FoodChoicesByCode | undefined)[],
  codes: readonly string[],
): FoodChoicesByCode | undefined {
  const picked: FoodChoicesByCode = {};
  for (const code of codes) {
    const found = sources.find((source) => source?.[code]?.length)?.[code];
    if (found) picked[code] = found;
  }
  return Object.keys(picked).length > 0 ? picked : undefined;
}
