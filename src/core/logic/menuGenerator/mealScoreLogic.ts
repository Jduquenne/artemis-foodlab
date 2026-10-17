import { AdvancedSettings, GeneratedSlotType, MealReason, PreferredFood, SeasonMode } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { frozenOutOfSeasonFoods, outOfSeasonFoods, recipeSeasonalFoods } from "../season/recipeSeasonLogic";
import { MenuCatalogue } from "./candidateLogic";
import { HabitMatcher, HabitNames, SlotHabits, habitScore } from "./habitLogic";
import { PREFERRED_FOOD_BONUS, preferredFoodReason } from "./preferredFoodLogic";

export interface ScoreContext {
  catalogue: MenuCatalogue;
  macros: Record<string, Macronutrients>;
  kcalTarget: number | null;
  weeksSinceEaten: Record<string, number>;
  season: SeasonMode;
  month: number;
  slot: GeneratedSlotType;
  previousCategoryId: string | null;
  nextCategoryId: string | null;
  sameDayCategoryIds: readonly string[];
  preferredFoods: readonly PreferredFood[];
  bonusFoodId: string | null;
  foodsOf: (code: string) => ReadonlySet<string>;
  habits: SlotHabits;
  matcher: HabitMatcher;
  names: HabitNames;
  quotaAdjust: (recipe: RecipeDetails) => CandidateScore;
  starchAdjust: (recipe: RecipeDetails) => CandidateScore;
  advanced: AdvancedSettings;
  favoriteCodes: ReadonlySet<string>;
  bonusFavoriteCode: string | null;
}

export const FAVORITE_BONUS = 2;

export interface CandidateScore {
  score: number;
  reasons: MealReason[];
}

export function slotKcalTarget(dailyTarget: number | null, slot: GeneratedSlotType, advanced: AdvancedSettings): number | null {
  return dailyTarget && dailyTarget > 0 ? Math.round((dailyTarget * advanced.kcalShares[slot]) / 100) : null;
}

export function kcalDeviation(kcal: number | undefined, target: number | null): number | null {
  return target && kcal ? Math.abs(kcal - target) / target : null;
}

function kcalScore(kcal: number | undefined, target: number | null, advanced: AdvancedSettings): CandidateScore {
  const deviation = kcalDeviation(kcal, target);
  if (deviation === null || kcal === undefined) return { score: 0, reasons: [] };
  const reason: MealReason = { kind: "kcal", label: `${Math.round(kcal)} kcal / portion (cible ${target})` };
  if (advanced.kcalMode === "off") return { score: 0, reasons: [reason] };
  const tolerance = advanced.kcalTolerance / 100;
  if (deviation <= tolerance) return { score: 2, reasons: [reason] };
  return { score: -Math.min(4, (deviation - tolerance) * 10), reasons: [reason] };
}

function historyScore(weeks: number | undefined, advanced: AdvancedSettings): CandidateScore {
  const off = advanced.repeatMode === "off";
  if (weeks === undefined) return { score: off ? 0 : 0.5, reasons: [{ kind: "history", label: "Jamais planifiée" }] };
  if (weeks <= 1) {
    const label = weeks <= 0 ? "Déjà planifiée cette semaine" : "Planifiée la semaine dernière";
    return { score: off ? 0 : -4, reasons: [{ kind: "recent", label }] };
  }
  if (weeks < advanced.repeatWeeks) return { score: off ? 0 : -2, reasons: [{ kind: "recent", label: `Planifiée il y a ${weeks} sem.` }] };
  return { score: off ? 0 : 1, reasons: [{ kind: "history", label: `Pas planifiée depuis ${weeks} sem.` }] };
}

function favoriteScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  if (!context.favoriteCodes.has(recipe.code)) return { score: 0, reasons: [] };
  return {
    score: context.bonusFavoriteCode === recipe.code ? FAVORITE_BONUS : 0,
    reasons: [{ kind: "favorite", label: "Recette favorite" }],
  };
}

function seasonScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  if (context.season === "off") return { score: 0, reasons: [] };
  const offSeason = outOfSeasonFoods(recipe, context.month, context.catalogue);
  if (offSeason.length > 0) {
    return { score: -2, reasons: [{ kind: "offSeason", label: `Hors saison : ${offSeason.map((food) => food.name).join(", ")}` }] };
  }
  const frozen = frozenOutOfSeasonFoods(recipe, context.month, context.catalogue);
  const frozenReasons: MealReason[] = frozen.length > 0
    ? [{ kind: "freezer", label: `Hors saison, mais au congélateur ou surgelé : ${frozen.map((food) => food.name).join(", ")}` }]
    : [];
  return recipeSeasonalFoods(recipe, context.catalogue).length > 0
    ? { score: 1, reasons: [{ kind: "season", label: "De saison" }, ...frozenReasons] }
    : { score: 0, reasons: frozenReasons };
}

function varietyScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  if (context.advanced.categoryInRow === "off") return { score: 0, reasons: [] };
  let score = 0;
  if (context.previousCategoryId === recipe.categoryId) score -= 3;
  if (context.nextCategoryId === recipe.categoryId) score -= 3;
  if (context.sameDayCategoryIds.includes(recipe.categoryId)) score -= 1;
  return { score, reasons: [] };
}

function preferredScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  if (context.preferredFoods.length === 0) return { score: 0, reasons: [] };
  const foodIds = context.foodsOf(recipe.code);
  const reason = preferredFoodReason(foodIds, context.preferredFoods, context.catalogue);
  const score = context.bonusFoodId && foodIds.has(context.bonusFoodId) ? PREFERRED_FOOD_BONUS : 0;
  return { score, reasons: reason ? [reason] : [] };
}

export function scoreCandidate(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  const parts = [
    habitScore(recipe, context.habits, context.matcher, context.names),
    context.quotaAdjust(recipe),
    context.starchAdjust(recipe),
    preferredScore(recipe, context),
    seasonScore(recipe, context),
    favoriteScore(recipe, context),
    historyScore(context.weeksSinceEaten[recipe.code], context.advanced),
    kcalScore(context.macros[recipe.code]?.kcal, slotKcalTarget(context.kcalTarget, context.slot, context.advanced), context.advanced),
    varietyScore(recipe, context),
  ];
  return {
    score: parts.reduce((sum, part) => sum + part.score, 0),
    reasons: parts.flatMap((part) => part.reasons),
  };
}
