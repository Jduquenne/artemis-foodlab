import { GeneratedMeal, GeneratedSlotType, MealReason, MenuGeneratorSettings, PeriodDay } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeUsageItem } from "../../domain/planningUsage";
import { RecipeDetails } from "../../domain/recipe";
import { createSeededRandom, pickRandom } from "../../utils/randomUtils";
import { weeksSinceIsoWeek } from "../../utils/weekUtils";
import { MenuCatalogue, dayCandidates, slotCandidates } from "./candidateLogic";
import { FreezerBatchStock } from "../freezer/freezerStockLogic";
import { FreezerPlan, createFreezerPlan, takeFreezerMeal } from "./freezerPlanLogic";
import { scoreCandidate } from "./mealScoreLogic";

export interface MenuEngineInput {
  days: readonly PeriodDay[];
  settings: MenuGeneratorSettings;
  catalogue: MenuCatalogue;
  macros: Record<string, Macronutrients>;
  kcalTarget: number | null;
  weeksSinceEaten: Record<string, number>;
  existing: Record<string, string[]>;
  fixed: Record<string, GeneratedMeal>;
  rejected: Record<string, string[]>;
  freezer: readonly FreezerBatchStock[];
  householdSize: number;
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
  score: (recipe: RecipeDetails) => { score: number; reasons: MealReason[] },
  random: () => number,
): { recipe: RecipeDetails; reasons: MealReason[] } | null {
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
  const fixedCodes = Object.values(input.fixed)
    .map((meal) => meal.recipeCode)
    .filter((code): code is string => code !== null);
  const used = new Set([...Object.values(input.existing).flat(), ...fixedCodes]);
  const meals: GeneratedMeal[] = [];
  let previousCategoryId: string | null = null;
  const freezerPlan: FreezerPlan | null = settings.freezerFirst
    ? createFreezerPlan(input.freezer, input.householdSize, [...Object.values(input.existing).flat(), ...fixedCodes])
    : null;

  for (const day of days) {
    const sameDayCategoryIds: string[] = [];
    for (const slot of settings.slots) {
      const key = mealKey(day.date, slot);
      const existingCodes = input.existing[key];
      const categoryOf = (code: string | undefined) => (code ? catalogue.recipes[code]?.categoryId ?? null : null);

      if (existingCodes && existingCodes.length > 0) {
        meals.push({ key, day, slot, recipeCode: null, kept: true, locked: true, reasons: [{ kind: "kept", label: "Déjà rempli dans le planning" }] });
        previousCategoryId = categoryOf(existingCodes[0]);
        if (previousCategoryId) sameDayCategoryIds.push(previousCategoryId);
        continue;
      }

      const fixed = input.fixed[key];
      if (fixed && (fixed.recipeCode === null || catalogue.recipes[fixed.recipeCode])) {
        meals.push({ ...fixed, day, slot, kept: false });
        previousCategoryId = categoryOf(fixed.recipeCode ?? undefined);
        if (previousCategoryId) sameDayCategoryIds.push(previousCategoryId);
        continue;
      }

      const rejected = input.rejected[key] ?? [];
      const slotPool = (candidatesBySlot.get(slot) ?? []).filter((recipe) => !rejected.includes(recipe.code));
      const frozen = freezerPlan
        ? takeFreezerMeal(freezerPlan, {
            candidates: slotPool,
            index: meals.length,
            previousCategoryId,
            sameDayCategoryIds,
          })
        : null;
      if (frozen) {
        used.add(frozen.recipe.code);
        meals.push({ key, day, slot, recipeCode: frozen.recipe.code, kept: false, locked: false, reasons: [frozen.reason] });
        previousCategoryId = frozen.recipe.categoryId;
        sameDayCategoryIds.push(frozen.recipe.categoryId);
        continue;
      }

      const eligible = dayCandidates(slotPool, day.month, settings.season, catalogue);
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
        meals.push({ key, day, slot, recipeCode: null, kept: false, locked: false, reasons: [{ kind: "empty", label: rejected.length > 0 ? "Aucune autre recette ne respecte les filtres" : "Aucune recette ne respecte les filtres" }] });
        previousCategoryId = null;
        continue;
      }

      used.add(choice.recipe.code);
      const reasons = fresh.length > 0 ? choice.reasons : [{ kind: "repeat", label: "Répétée faute d'autre recette" } satisfies MealReason, ...choice.reasons];
      meals.push({ key, day, slot, recipeCode: choice.recipe.code, kept: false, locked: false, reasons });
      previousCategoryId = choice.recipe.categoryId;
      sameDayCategoryIds.push(choice.recipe.categoryId);
    }
  }
  return meals;
}
