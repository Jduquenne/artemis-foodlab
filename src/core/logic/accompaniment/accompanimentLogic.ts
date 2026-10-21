import {
  Accompaniment,
  AccompanimentChoice,
  AccompanimentDefault,
  AccompanimentOption,
  ResolvedAccompaniment,
} from "../../domain/accompaniment";
import { FoodChoice } from "../../domain/foodGroup";
import { Food } from "../../domain/ingredient";
import { MealSlot } from "../../domain/planning";
import { Profile } from "../../domain/profile";
import { RecipeDetails } from "../../domain/recipe";
import { ReachableGroupIngredient, reachableGroupIngredients } from "../foodGroup/foodChoiceLogic";
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
  return { ...slot, foodChoices, accompanimentChoices };
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

export function accompanimentLabelsFor(
  recipeCode: string,
  profile: AccompanimentProfile,
  mealChoices: readonly AccompanimentChoice[],
  accompaniments: readonly Accompaniment[],
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
): string[] {
  return accompanimentsFor(recipeCode, accompaniments).flatMap((accompaniment) => {
    const { option } = resolveAccompaniment(accompaniment, profile, mealChoices);
    return option ? [accompanimentOptionLabel(option, recipes, foods)] : [];
  });
}
