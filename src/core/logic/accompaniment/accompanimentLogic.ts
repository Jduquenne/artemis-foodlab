import {
  Accompaniment,
  AccompanimentChoice,
  AccompanimentDefault,
  AccompanimentOption,
  ResolvedAccompaniment,
} from "../../domain/accompaniment";
import { FoodChoice } from "../../domain/foodGroup";
import { pruneBaseVersionChoices } from "../baseVersion/baseVersionLogic";
import { Food } from "../../domain/ingredient";
import { MealSlot } from "../../domain/planning";
import { Profile } from "../../domain/profile";
import { RecipeDetails } from "../../domain/recipe";
import { FoodPersonalization, ReachableGroupIngredient, personalizeRecipeTree, reachableGroupIngredients } from "../foodGroup/foodChoiceLogic";
import { roundTo } from "../../utils/numberUtils";
import { parseUnit } from "../unit/unitLogic";
import { accompanimentOptionLabel } from "./accompanimentFormLogic";

export type AccompanimentProfile = Pick<Profile, "id" | "accompanimentDefaults">;

export interface ChoiceContext {
  accompaniments: readonly Accompaniment[];
  profiles: readonly AccompanimentProfile[];
}

export function accompanimentsFor(recipeCode: string, accompaniments: readonly Accompaniment[]): Accompaniment[] {
  return accompaniments.filter((accompaniment) => accompaniment.recipeCodes.includes(recipeCode));
}

export function findAccompanimentOption(accompaniment: Accompaniment, optionId: string | null): AccompanimentOption | null {
  if (optionId === null) return null;
  return accompaniment.options.find((option) => option.id === optionId) ?? null;
}

export function findAccompanimentChoice(
  choices: readonly AccompanimentChoice[],
  accompanimentId: string,
  profileId: string,
): AccompanimentChoice | undefined {
  return choices.find((c) => c.accompanimentId === accompanimentId && c.profileId === profileId);
}

export function findAccompanimentDefault(
  defaults: readonly AccompanimentDefault[],
  accompanimentId: string,
): AccompanimentDefault | undefined {
  return defaults.find((d) => d.accompanimentId === accompanimentId);
}

export function resolveAccompaniment(
  accompaniment: Accompaniment,
  profile: AccompanimentProfile,
  mealChoices: readonly AccompanimentChoice[],
): ResolvedAccompaniment {
  const choice = findAccompanimentChoice(mealChoices, accompaniment.id, profile.id);
  if (choice) return { option: findAccompanimentOption(accompaniment, choice.optionId), source: "meal" };
  const profileDefault = findAccompanimentDefault(profile.accompanimentDefaults, accompaniment.id);
  if (profileDefault) return { option: findAccompanimentOption(accompaniment, profileDefault.optionId), source: "profile" };
  return { option: findAccompanimentOption(accompaniment, accompaniment.defaultOptionId), source: "accompaniment" };
}

function choiceKey(choice: AccompanimentChoice): string {
  return `${choice.accompanimentId}|${choice.profileId}|${choice.optionId ?? ""}`;
}

export function sameAccompanimentChoices(
  a: readonly AccompanimentChoice[] | undefined,
  b: readonly AccompanimentChoice[] | undefined,
): boolean {
  const left = (a ?? []).map(choiceKey).sort();
  const right = (b ?? []).map(choiceKey).sort();
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function pruneAccompanimentChoices(
  choices: AccompanimentChoice[],
  recipeCode: string,
  accompaniments: readonly Accompaniment[],
): AccompanimentChoice[] {
  const applying = new Map(accompanimentsFor(recipeCode, accompaniments).map((a) => [a.id, a]));
  const kept = choices.filter((choice) => {
    const accompaniment = applying.get(choice.accompanimentId);
    if (!accompaniment) return false;
    return choice.optionId === null || accompaniment.options.some((option) => option.id === choice.optionId);
  });
  return kept.length === choices.length ? choices : kept;
}

export function pruneAccompanimentDefaults(
  defaults: AccompanimentDefault[],
  accompaniments: readonly Accompaniment[],
): AccompanimentDefault[] {
  const byId = new Map(accompaniments.map((a) => [a.id, a]));
  const kept = defaults.filter((d) => {
    const accompaniment = byId.get(d.accompanimentId);
    if (!accompaniment) return false;
    return d.optionId === null || accompaniment.options.some((option) => option.id === d.optionId);
  });
  return kept.length === defaults.length ? defaults : kept;
}

export function effectiveOptionRecipes(
  recipeCode: string,
  profile: AccompanimentProfile,
  mealChoices: readonly AccompanimentChoice[],
  accompaniments: readonly Accompaniment[],
  recipes: Record<string, RecipeDetails>,
): RecipeDetails[] {
  return accompanimentsFor(recipeCode, accompaniments).flatMap((accompaniment) => {
    const { option } = resolveAccompaniment(accompaniment, profile, mealChoices);
    const recipe = option?.kind === "recipe" && option.recipeCode ? recipes[option.recipeCode] : undefined;
    return recipe ? [recipe] : [];
  });
}

function pruneItemFoodChoices(
  choices: FoodChoice[],
  recipe: RecipeDetails,
  mealChoices: readonly AccompanimentChoice[],
  recipes: Record<string, RecipeDetails>,
  context: ChoiceContext,
): FoodChoice[] {
  const dishIds = new Set(reachableGroupIngredients(recipe, recipes).map((entry) => entry.ingredient.id));
  const optionIds = new Map<string, Set<string>>();
  const reachableFor = (profileId: string): Set<string> => {
    const cached = optionIds.get(profileId);
    if (cached) return cached;
    const profile = context.profiles.find((p) => p.id === profileId);
    const roots = profile ? effectiveOptionRecipes(recipe.code, profile, mealChoices, context.accompaniments, recipes) : [];
    const ids = new Set(roots.flatMap((root) => reachableGroupIngredients(root, recipes).map((entry) => entry.ingredient.id)));
    optionIds.set(profileId, ids);
    return ids;
  };
  const kept = choices.filter((c) => dishIds.has(c.recipeIngredientId) || reachableFor(c.profileId).has(c.recipeIngredientId));
  return kept.length === choices.length ? choices : kept;
}

export function pruneSlotChoices(slot: MealSlot, recipes: Record<string, RecipeDetails>, context: ChoiceContext): MealSlot {
  const accompanimentChoices = slot.accompanimentChoices
    ? Object.fromEntries(
      Object.entries(slot.accompanimentChoices).map(([code, choices]) => [
        code,
        recipes[code] ? pruneAccompanimentChoices(choices, code, context.accompaniments) : choices,
      ]),
    )
    : undefined;
  const foodChoices = slot.foodChoices
    ? Object.fromEntries(
      Object.entries(slot.foodChoices).map(([code, choices]) => {
        const recipe = recipes[code];
        const mealChoices = accompanimentChoices?.[code] ?? [];
        return [code, recipe ? pruneItemFoodChoices(choices, recipe, mealChoices, recipes, context) : choices];
      }),
    )
    : undefined;
  const baseVersionChoices = slot.baseVersionChoices
    ? Object.fromEntries(
      Object.entries(slot.baseVersionChoices).map(([code, choices]) => {
        const recipe = recipes[code];
        return [code, recipe ? pruneBaseVersionChoices(choices, recipe, recipes) : choices];
      }),
    )
    : undefined;
  return { ...slot, foodChoices, accompanimentChoices, baseVersionChoices };
}

export interface MealChoiceIngredient {
  entry: ReachableGroupIngredient;
  ownerName: string | null;
  profileIds: string[];
}

export function mealChoiceIngredients(
  recipe: RecipeDetails,
  recipes: Record<string, RecipeDetails>,
  accompaniments: readonly Accompaniment[],
  profiles: readonly AccompanimentProfile[],
  accompanimentChoices: readonly AccompanimentChoice[],
): MealChoiceIngredient[] {
  const allIds = profiles.map((p) => p.id);
  const result = new Map<string, MealChoiceIngredient>();
  for (const entry of reachableGroupIngredients(recipe, recipes)) {
    result.set(entry.ingredient.id, { entry, ownerName: entry.ownerName, profileIds: allIds });
  }
  const applying = accompanimentsFor(recipe.code, accompaniments);
  for (const profile of profiles) {
    for (const accompaniment of applying) {
      const { option } = resolveAccompaniment(accompaniment, profile, accompanimentChoices);
      const optionRecipe = option?.kind === "recipe" && option.recipeCode ? recipes[option.recipeCode] : undefined;
      if (!option || !optionRecipe) continue;
      for (const entry of reachableGroupIngredients(optionRecipe, recipes, option.portionsPerPerson ?? 1)) {
        const id = entry.ingredient.id;
        const existing = result.get(id);
        if (existing) {
          if (!existing.profileIds.includes(profile.id)) result.set(id, { ...existing, profileIds: [...existing.profileIds, profile.id] });
          continue;
        }
        result.set(id, { entry, ownerName: entry.ownerName ?? optionRecipe.name, profileIds: [profile.id] });
      }
    }
  }
  return [...result.values()];
}

export function setAccompanimentChoice(
  choices: readonly AccompanimentChoice[],
  accompanimentId: string,
  profileId: string,
  optionId: string | null | undefined,
): AccompanimentChoice[] {
  const others = choices.filter((c) => !(c.accompanimentId === accompanimentId && c.profileId === profileId));
  return optionId === undefined ? others : [...others, { accompanimentId, profileId, optionId }];
}

export interface AccompanimentLine {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
}

export interface AccompanimentDetail {
  id: string;
  label: string;
  lines: AccompanimentLine[];
}

function optionLines(
  option: AccompanimentOption,
  personalization: FoodPersonalization,
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  dishPortions: number,
): AccompanimentLine[] {
  if (option.kind === "food") {
    const food = option.foodId ? foods[option.foodId] : undefined;
    if (!food) return [];
    const quantity = option.quantityPerPerson === null ? null : roundTo(option.quantityPerPerson * dishPortions, 2);
    return [{ id: option.id, name: food.name, quantity, unit: quantity === null ? "" : parseUnit(option.unit) }];
  }
  const recipe = option.recipeCode ? recipes[option.recipeCode] : undefined;
  if (!recipe) return [];
  const portions = option.portionsPerPerson ?? 1;
  const personalized = personalizeRecipeTree(recipe, personalization, recipes, foods, portions).recipe;
  const factor = (portions * dishPortions) / personalized.defaultPortions;
  return personalized.ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    quantity: ingredient.quantity === null ? null : roundTo(ingredient.quantity * factor, 2),
    unit: ingredient.quantity === null ? "" : ingredient.unit,
  }));
}

export function accompanimentDetailsFor(
  recipeCode: string,
  personalization: FoodPersonalization & { profile: AccompanimentProfile },
  accompanimentChoices: readonly AccompanimentChoice[],
  accompaniments: readonly Accompaniment[],
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  dishPortions: number,
): AccompanimentDetail[] {
  return accompanimentsFor(recipeCode, accompaniments).flatMap((accompaniment) => {
    const { option } = resolveAccompaniment(accompaniment, personalization.profile, accompanimentChoices);
    if (!option) return [];
    return [{
      id: accompaniment.id,
      label: accompanimentOptionLabel(option, recipes, foods),
      lines: optionLines(option, personalization, recipes, foods, dishPortions),
    }];
  });
}
