import { DessertPick, DessertRule, GeneratedSlotType, SeasonMode } from "../../domain/menuGenerator";
import { RecipeDetails } from "../../domain/recipe";
import { isDessert } from "../../domain/recipePredicates";
import { normalizeQuery, rankByQuery } from "../../utils/textUtils";
import { pickRandom } from "../../utils/randomUtils";
import { MenuCatalogue, seasonAllows, usesExcludedFood } from "./candidateLogic";
import { HabitMatcher, HabitNames, habitTargetLabel, matchesHabitTarget, validateHabitTarget } from "./habitLogic";

export const MAX_DESSERTS_PER_RULE = 3;

const MAX_DESSERT_SUGGESTIONS = 8;

export function emptyDessertRule(id: string): DessertRule {
  return { id, enabled: true, days: [], slots: [], items: [] };
}

export function validateDessertRule(rule: DessertRule): string | null {
  if (rule.days.length === 0) return "Choisis au moins un jour.";
  if (rule.slots.length === 0) return "Choisis au moins un repas.";
  if (rule.items.length === 0) return "Ajoute au moins un dessert.";
  if (rule.items.length > MAX_DESSERTS_PER_RULE) return `Au plus ${MAX_DESSERTS_PER_RULE} desserts par repas.`;
  for (const item of rule.items) {
    if (item.kind === "recipe" && !item.recipeCode) return "Choisis la recette de chaque dessert.";
    if (item.kind === "pick") {
      const problem = validateHabitTarget(item.target);
      if (problem) return problem;
    }
  }
  return null;
}

export function dessertRuleFor(rules: readonly DessertRule[], dayName: string, slot: GeneratedSlotType): DessertRule | null {
  return rules.find((rule) => rule.enabled && rule.days.includes(dayName) && rule.slots.includes(slot)) ?? null;
}

export function dessertPickLabel(item: DessertPick, names: HabitNames): string {
  return item.kind === "recipe"
    ? (names.catalogue.recipes[item.recipeCode]?.name ?? item.recipeCode)
    : `Au choix : ${habitTargetLabel(item.target, names)}`;
}

export function dessertCandidates(
  catalogue: MenuCatalogue,
  excludedFoodIds: readonly string[],
  bannedRecipeCodes: readonly string[],
): RecipeDetails[] {
  return Object.values(catalogue.recipes).filter(
    (recipe) => isDessert(recipe) && !bannedRecipeCodes.includes(recipe.code) && !usesExcludedFood(recipe, excludedFoodIds, catalogue),
  );
}

export function seasonalDessertPool(
  pool: readonly RecipeDetails[],
  month: number,
  season: SeasonMode,
  catalogue: MenuCatalogue,
): RecipeDetails[] {
  if (season === "off") return [...pool];
  const inSeason = pool.filter((recipe) => seasonAllows(recipe, month, "strict", catalogue));
  return season === "strict" || inSeason.length > 0 ? inSeason : [...pool];
}

export function pickDessert(
  item: DessertPick,
  pool: readonly RecipeDetails[],
  avoid: ReadonlySet<string>,
  matcher: HabitMatcher,
  random: () => number,
): string | null {
  if (item.kind === "recipe") return item.recipeCode;
  const matching = pool.filter((recipe) => matchesHabitTarget(recipe, item.target, matcher));
  const fresh = matching.filter((recipe) => !avoid.has(recipe.code));
  return pickRandom(fresh.length > 0 ? fresh : matching, random)?.code ?? null;
}

export function searchDessertRecipes(query: string, recipes: Record<string, RecipeDetails>): RecipeDetails[] {
  const desserts = Object.values(recipes).filter((recipe) => isDessert(recipe));
  return rankByQuery(desserts, normalizeQuery(query), (recipe) => recipe.name).slice(0, MAX_DESSERT_SUGGESTIONS);
}
