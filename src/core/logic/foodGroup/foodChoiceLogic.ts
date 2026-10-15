import { FoodChoice, FoodGroupDefault, ResolvedFood } from "../../domain/foodGroup";
import { Food, Ingredient } from "../../domain/ingredient";
import { Profile } from "../../domain/profile";
import { compareByName } from "../../utils/sortUtils";

export type FoodChoiceStatus = "none" | "partial" | "complete";

export type FoodChoicesByCode = Record<string, FoodChoice[]>;

export function resolveIngredientFood(
  ingredient: Ingredient,
  profileId: string,
  profileDefaults: readonly FoodGroupDefault[],
  mealChoices: readonly FoodChoice[],
): ResolvedFood | null {
  if (!ingredient.foodId) return null;
  if (!ingredient.foodGroupId) return { foodId: ingredient.foodId, source: "recipe" };

  const choice = mealChoices.find((c) => c.recipeIngredientId === ingredient.id && c.profileId === profileId);
  if (choice) return { foodId: choice.foodId, source: "meal" };

  const profileDefault = profileDefaults.find((d) => d.foodGroupId === ingredient.foodGroupId);
  if (profileDefault) return { foodId: profileDefault.foodId, source: "profile" };

  return { foodId: ingredient.foodId, source: "recipe" };
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
  const others = choices.filter((c) => !(c.recipeIngredientId === recipeIngredientId && c.profileId === profileId));
  return foodId ? [...others, { recipeIngredientId, profileId, foodId }] : others;
}

function choiceKey(choice: FoodChoice): string {
  return `${choice.recipeIngredientId}|${choice.profileId}|${choice.foodId}`;
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
