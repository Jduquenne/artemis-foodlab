import { FoodChoice, FoodGroup, FoodGroupDefault, ResolvedFood } from "../../domain/foodGroup";
import { Food, Ingredient } from "../../domain/ingredient";
import { Profile } from "../../domain/profile";
import { RecipeDetails } from "../../domain/recipe";
import { compareByName } from "../../utils/sortUtils";

export type FoodChoiceStatus = "none" | "partial" | "complete";

export type FoodChoicesByCode = Record<string, FoodChoice[]>;

export interface FoodGroupWithFoods {
  group: FoodGroup;
  foods: Food[];
}

export interface FoodPersonalization {
  profile: Pick<Profile, "id" | "foodGroupDefaults">;
  mealChoices: readonly FoodChoice[];
}

export interface ReachableGroupIngredient {
  ingredient: Ingredient;
  ownerCode: string;
  ownerName: string | null;
  portionFactor: number;
}

export interface PersonalizedRecipeTree {
  recipe: RecipeDetails;
  recipes: Record<string, RecipeDetails>;
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

export function foodGroupsWithFoods(groups: readonly FoodGroup[], foods: Record<string, Food>): FoodGroupWithFoods[] {
  return [...groups]
    .sort(compareByName)
    .map((group) => ({ group, foods: foodsOfGroupSorted(foods, group.id) }))
    .filter((entry) => entry.foods.length > 0);
}

export function findFoodGroupDefault(defaults: readonly FoodGroupDefault[], groupId: string): string | null {
  return defaults.find((d) => d.foodGroupId === groupId)?.foodId ?? null;
}

export function withoutFoodGroupDefault<T extends Pick<Profile, "foodGroupDefaults">>(profile: T, groupId: string): T {
  return { ...profile, foodGroupDefaults: profile.foodGroupDefaults.filter((d) => d.foodGroupId !== groupId) };
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
  choiceShare = 1,
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
    const perPortion = resolved.quantityPerPortion !== null ? resolved.quantityPerPortion * choiceShare : recipePerPortion;
    const quantity = perPortion * portionsPerProfile;
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

function collectGroupIngredients(
  recipe: RecipeDetails,
  rootCode: string,
  factor: number,
  recipes: Record<string, RecipeDetails>,
  path: ReadonlySet<string>,
  found: Map<string, ReachableGroupIngredient>,
): void {
  if (path.has(recipe.code)) return;
  const nextPath = new Set(path).add(recipe.code);
  for (const ingredient of recipe.ingredients) {
    if (ingredient.baseId) {
      const base = recipes[ingredient.baseId];
      const baseFactor = (factor * (ingredient.quantity ?? 0)) / Math.max(base?.defaultPortions ?? 1, 1);
      if (base) collectGroupIngredients(base, rootCode, baseFactor, recipes, nextPath, found);
      continue;
    }
    if (!ingredient.foodGroupId || !ingredient.foodId) continue;
    const existing = found.get(ingredient.id);
    if (existing) {
      found.set(ingredient.id, { ...existing, portionFactor: existing.portionFactor + factor });
    } else {
      const ownerName = recipe.code === rootCode ? null : recipe.name;
      found.set(ingredient.id, { ingredient, ownerCode: recipe.code, ownerName, portionFactor: factor });
    }
  }
}

export function reachableGroupIngredients(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
): ReachableGroupIngredient[] {
  const found = new Map<string, ReachableGroupIngredient>();
  collectGroupIngredients(recipe, recipe.code, 1 / Math.max(recipe.defaultPortions, 1), recipes, new Set(), found);
  return [...found.values()];
}

export function reachableQuantityPerPortion(entry: ReachableGroupIngredient): number | null {
  return entry.ingredient.quantity === null ? null : entry.ingredient.quantity * entry.portionFactor;
}

export function pruneFoodChoices(
  choices: FoodChoice[],
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
): FoodChoice[] {
  const reachable = new Set(reachableGroupIngredients(recipe, recipes).map((entry) => entry.ingredient.id));
  const kept = choices.filter((choice) => reachable.has(choice.recipeIngredientId));
  return kept.length === choices.length ? choices : kept;
}

export function pruneSlotFoodChoices(
  foodChoices: Record<string, FoodChoice[]> | undefined,
  recipes: Record<string, RecipeDetails>,
): Record<string, FoodChoice[]> | undefined {
  if (!foodChoices) return foodChoices;
  return Object.fromEntries(
    Object.entries(foodChoices).map(([code, choices]) => {
      const recipe = recipes[code];
      return [code, recipe ? pruneFoodChoices(choices, recipe, recipes) : choices];
    }),
  );
}

export function personalizeRecipeTree(
  recipe: RecipeDetails,
  personalization: FoodPersonalization,
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
): PersonalizedRecipeTree {
  const { profile, mealChoices } = personalization;
  const changes = new Map<string, Map<string, Ingredient>>();
  for (const { ingredient, ownerCode, portionFactor } of reachableGroupIngredients(recipe, recipes)) {
    const resolved = resolveIngredientFood(ingredient, profile.id, profile.foodGroupDefaults, mealChoices);
    if (!resolved) continue;
    const quantity =
      resolved.quantityPerPortion !== null && portionFactor > 0 ? resolved.quantityPerPortion / portionFactor : ingredient.quantity;
    if (resolved.foodId === ingredient.foodId && quantity === ingredient.quantity) continue;
    const owner = changes.get(ownerCode) ?? new Map<string, Ingredient>();
    owner.set(ingredient.id, { ...ingredient, foodId: resolved.foodId, name: foods[resolved.foodId]?.name ?? ingredient.name, quantity });
    changes.set(ownerCode, owner);
  }
  if (changes.size === 0) return { recipe, recipes };

  const apply = (target: RecipeDetails): RecipeDetails => {
    const owned = changes.get(target.code);
    return owned ? { ...target, ingredients: target.ingredients.map((ing) => owned.get(ing.id) ?? ing) } : target;
  };
  const baseCodes = [...changes.keys()].filter((code) => code !== recipe.code && recipes[code]);
  const personalizedRecipes = baseCodes.length === 0
    ? recipes
    : { ...recipes, ...Object.fromEntries(baseCodes.map((code) => [code, apply(recipes[code])])) };
  return { recipe: apply(recipe), recipes: personalizedRecipes };
}

export function personalizeRecipe(
  recipe: RecipeDetails,
  personalization: FoodPersonalization,
  foods: Record<string, Food>,
): RecipeDetails {
  return personalizeRecipeTree(recipe, personalization, {}, foods).recipe;
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
