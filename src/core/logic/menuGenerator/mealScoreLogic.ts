import { KCAL_SLOT_SHARE, KCAL_TOLERANCE, RECENT_HISTORY_WEEKS, GeneratedSlotType, MealReason, SeasonMode } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeDetails } from "../../domain/recipe";
import { outOfSeasonFoods, recipeSeasonalFoods } from "../season/recipeSeasonLogic";
import { MenuCatalogue } from "./candidateLogic";

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
}

export interface CandidateScore {
  score: number;
  reasons: MealReason[];
}

export function slotKcalTarget(dailyTarget: number | null, slot: GeneratedSlotType): number | null {
  return dailyTarget && dailyTarget > 0 ? Math.round(dailyTarget * KCAL_SLOT_SHARE[slot]) : null;
}

function kcalScore(kcal: number | undefined, target: number | null): CandidateScore {
  if (!target || !kcal) return { score: 0, reasons: [] };
  const deviation = Math.abs(kcal - target) / target;
  const reason: MealReason = { kind: "kcal", label: `${Math.round(kcal)} kcal / portion (cible ${target})` };
  if (deviation <= KCAL_TOLERANCE) return { score: 2, reasons: [reason] };
  return { score: -Math.min(4, (deviation - KCAL_TOLERANCE) * 10), reasons: [reason] };
}

function historyScore(weeks: number | undefined): CandidateScore {
  if (weeks === undefined) return { score: 0.5, reasons: [{ kind: "history", label: "Jamais planifiée" }] };
  if (weeks <= 1) return { score: -4, reasons: [{ kind: "recent", label: weeks <= 0 ? "Déjà planifiée cette semaine" : "Planifiée la semaine dernière" }] };
  if (weeks < RECENT_HISTORY_WEEKS) return { score: -2, reasons: [{ kind: "recent", label: `Planifiée il y a ${weeks} sem.` }] };
  return { score: 1, reasons: [{ kind: "history", label: `Pas planifiée depuis ${weeks} sem.` }] };
}

function seasonScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  if (context.season === "off") return { score: 0, reasons: [] };
  const offSeason = outOfSeasonFoods(recipe, context.month, context.catalogue);
  if (offSeason.length > 0) {
    return { score: -2, reasons: [{ kind: "offSeason", label: `Hors saison : ${offSeason.map((food) => food.name).join(", ")}` }] };
  }
  return recipeSeasonalFoods(recipe, context.catalogue).length > 0
    ? { score: 1, reasons: [{ kind: "season", label: "De saison" }] }
    : { score: 0, reasons: [] };
}

function varietyScore(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  let score = 0;
  if (context.previousCategoryId === recipe.categoryId) score -= 3;
  if (context.nextCategoryId === recipe.categoryId) score -= 3;
  if (context.sameDayCategoryIds.includes(recipe.categoryId)) score -= 1;
  return { score, reasons: [] };
}

export function scoreCandidate(recipe: RecipeDetails, context: ScoreContext): CandidateScore {
  const parts = [
    seasonScore(recipe, context),
    historyScore(context.weeksSinceEaten[recipe.code]),
    kcalScore(context.macros[recipe.code]?.kcal, slotKcalTarget(context.kcalTarget, context.slot)),
    varietyScore(recipe, context),
  ];
  return {
    score: parts.reduce((sum, part) => sum + part.score, 0),
    reasons: parts.flatMap((part) => part.reasons),
  };
}
