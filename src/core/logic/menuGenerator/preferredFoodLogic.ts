import { MealReason, PreferredFood } from "../../domain/menuGenerator";
import { RecipeDetails } from "../../domain/recipe";
import { pickRandom } from "../../utils/randomUtils";
import { foodsOfGroupSorted } from "../foodGroup/foodChoiceLogic";
import { MenuCatalogue } from "./candidateLogic";

export const PREFERRED_FOOD_BONUS = 2;

export interface RequirementSlot {
  key: string;
  candidates: readonly RecipeDetails[];
}

function collectFoodIds(recipe: RecipeDetails, catalogue: MenuCatalogue, visited: Set<string>, found: Set<string>): void {
  if (visited.has(recipe.code)) return;
  visited.add(recipe.code);
  for (const ingredient of recipe.ingredients) {
    if (ingredient.foodGroupId) {
      for (const food of foodsOfGroupSorted(catalogue.foods, ingredient.foodGroupId)) found.add(food.id);
    }
    if (ingredient.foodId) found.add(ingredient.foodId);
    const base = ingredient.baseId ? catalogue.recipes[ingredient.baseId] : undefined;
    if (base) collectFoodIds(base, catalogue, visited, found);
  }
}

export function recipeFoodIds(recipe: RecipeDetails, catalogue: MenuCatalogue): Set<string> {
  const found = new Set<string>();
  collectFoodIds(recipe, catalogue, new Set(), found);
  return found;
}

export function createFoodIndex(catalogue: MenuCatalogue): (code: string | null | undefined) => ReadonlySet<string> {
  const cache = new Map<string, Set<string>>();
  const empty = new Set<string>();
  return (code) => {
    const recipe = code ? catalogue.recipes[code] : undefined;
    if (!recipe) return empty;
    const cached = cache.get(recipe.code);
    if (cached) return cached;
    const ids = recipeFoodIds(recipe, catalogue);
    cache.set(recipe.code, ids);
    return ids;
  };
}

export function preferredFoodReason(foodIds: ReadonlySet<string>, preferred: readonly PreferredFood[], catalogue: MenuCatalogue): MealReason | null {
  const names = preferred.filter((item) => foodIds.has(item.foodId)).map((item) => catalogue.foods[item.foodId]?.name ?? item.foodId);
  return names.length > 0 ? { kind: "preferred", label: `Utilise : ${names.join(", ")}` } : null;
}

export function assignToRandomSlots(
  targetIds: readonly string[],
  slots: readonly RequirementSlot[],
  matches: (recipe: RecipeDetails, targetId: string) => boolean,
  random: () => number,
): Record<string, string> {
  const assigned: Record<string, string> = {};
  for (const targetId of targetIds) {
    const options = slots.filter((slot) => !assigned[slot.key] && slot.candidates.some((recipe) => matches(recipe, targetId)));
    const picked = pickRandom(options, random);
    if (picked) assigned[picked.key] = targetId;
  }
  return assigned;
}
