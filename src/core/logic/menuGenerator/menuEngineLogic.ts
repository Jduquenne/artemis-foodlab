import { GeneratedMeal, GeneratedSlotType, MenuGeneratorSettings, PeriodDay } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeUsageItem } from "../../domain/planningUsage";
import { RecipeDetails } from "../../domain/recipe";
import { createSeededRandom, pickRandom } from "../../utils/randomUtils";
import { weeksSinceIsoWeek } from "../../utils/weekUtils";
import { MenuCatalogue, dayCandidates, slotCandidates } from "./candidateLogic";
import { scoreCandidate } from "./mealScoreLogic";

export interface MenuEngineInput {
  days: readonly PeriodDay[];
  settings: MenuGeneratorSettings;
  catalogue: MenuCatalogue;
  macros: Record<string, Macronutrients>;
  kcalTarget: number | null;
  weeksSinceEaten: Record<string, number>;
  existing: Record<string, string[]>;
  locked: Record<string, string>;
  seed: number;
}

const SCORE_BAND = 1;

export function mealKey(date: string, slot: GeneratedSlotType): string {
  return `${date}:${slot}`;
}

export function weeksSinceEatenMap(usage: readonly RecipeUsageItem[], now: Date): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of usage) {
    const weeks = weeksSinceIsoWeek(item.lastWeek, now);
    if (weeks !== null) result[item.code] = weeks;
  }
  return result;
}

function chooseRecipe(
  pool: readonly RecipeDetails[],
  score: (recipe: RecipeDetails) => { score: number; reasons: string[] },
  random: () => number,
): { recipe: RecipeDetails; reasons: string[] } | null {
  if (pool.length === 0) return null;
  const scored = pool.map((recipe) => ({ recipe, ...score(recipe) }));
  const best = Math.max(...scored.map((entry) => entry.score));
  const picked = pickRandom(scored.filter((entry) => entry.score >= best - SCORE_BAND), random);
  return picked ? { recipe: picked.recipe, reasons: picked.reasons } : null;
}

export function generateMenu(input: MenuEngineInput): GeneratedMeal[] {
  const { days, settings, catalogue } = input;
  const random = createSeededRandom(input.seed);
  const candidatesBySlot = new Map(settings.slots.map((slot) => [slot, slotCandidates(catalogue, slot, settings)]));
  const used = new Set(Object.values(input.existing).flat());
  for (const code of Object.values(input.locked)) used.add(code);
  const meals: GeneratedMeal[] = [];
  let previousCategoryId: string | null = null;

  for (const day of days) {
    const sameDayCategoryIds: string[] = [];
    for (const slot of settings.slots) {
      const key = mealKey(day.date, slot);
      const existingCodes = input.existing[key];
      const categoryOf = (code: string | undefined) => (code ? catalogue.recipes[code]?.categoryId ?? null : null);

      if (existingCodes && existingCodes.length > 0) {
        meals.push({ key, day, slot, recipeCode: null, kept: true, locked: true, reasons: ["Déjà rempli dans le planning"] });
        previousCategoryId = categoryOf(existingCodes[0]);
        if (previousCategoryId) sameDayCategoryIds.push(previousCategoryId);
        continue;
      }

      const lockedCode = input.locked[key];
      if (lockedCode && catalogue.recipes[lockedCode]) {
        meals.push({ key, day, slot, recipeCode: lockedCode, kept: false, locked: true, reasons: ["Gardée par toi"] });
        previousCategoryId = categoryOf(lockedCode);
        if (previousCategoryId) sameDayCategoryIds.push(previousCategoryId);
        continue;
      }

      const eligible = dayCandidates(candidatesBySlot.get(slot) ?? [], day.month, settings.season, catalogue);
      const fresh = eligible.filter((recipe) => !used.has(recipe.code));
      const pool = fresh.length > 0 ? fresh : eligible;
      const context = {
        catalogue,
        macros: input.macros,
        kcalTarget: input.kcalTarget,
        weeksSinceEaten: input.weeksSinceEaten,
        season: settings.season,
        month: day.month,
        slot,
        previousCategoryId,
        sameDayCategoryIds,
      };
      const choice = chooseRecipe(pool, (recipe) => scoreCandidate(recipe, context), random);

      if (!choice) {
        meals.push({ key, day, slot, recipeCode: null, kept: false, locked: false, reasons: ["Aucune recette ne respecte les filtres"] });
        previousCategoryId = null;
        continue;
      }

      used.add(choice.recipe.code);
      const reasons = fresh.length > 0 ? choice.reasons : ["Répétée faute d'autre recette", ...choice.reasons];
      meals.push({ key, day, slot, recipeCode: choice.recipe.code, kept: false, locked: false, reasons });
      previousCategoryId = choice.recipe.categoryId;
      sameDayCategoryIds.push(choice.recipe.categoryId);
    }
  }
  return meals;
}
