import { GeneratedMeal, GeneratedSlotType, MealReason, MenuGeneratorSettings, PeriodDay } from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeUsageItem } from "../../domain/planningUsage";
import { RecipeDetails } from "../../domain/recipe";
import { createSeededRandom, pickRandom } from "../../utils/randomUtils";
import { weeksSinceIsoWeek } from "../../utils/weekUtils";
import { MenuCatalogue, dayCandidates, slotCandidates } from "./candidateLogic";
import { FreezerBatchStock } from "../freezer/freezerStockLogic";
import { FreezerReservation, OpenSlot, createFreezerPlan, reserveFreezerSlots } from "./freezerPlanLogic";
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
  const existingCodes = Object.values(input.existing).flat();
  const used = new Set([...existingCodes, ...fixedCodes]);
  const categoryOf = (code: string | null | undefined) => (code ? (catalogue.recipes[code]?.categoryId ?? null) : null);
  const slotPoolOf = (slot: GeneratedSlotType, key: string) => {
    const rejected = input.rejected[key] ?? [];
    return (candidatesBySlot.get(slot) ?? []).filter((recipe) => !rejected.includes(recipe.code));
  };

  const sequence = days.flatMap((day) => settings.slots.map((slot) => ({ day, slot, key: mealKey(day.date, slot) })));
  const isKept = (key: string) => (input.existing[key]?.length ?? 0) > 0;
  const fixedOf = (key: string) => {
    const fixed = input.fixed[key];
    return fixed && (fixed.recipeCode === null || catalogue.recipes[fixed.recipeCode]) ? fixed : null;
  };
  const openSlots: OpenSlot[] = sequence.flatMap(({ day, slot, key }, index) =>
    !isKept(key) && !fixedOf(key)
      ? [{ key, index, date: day.date, candidateCodes: new Set(slotPoolOf(slot, key).map((recipe) => recipe.code)) }]
      : [],
  );
  const reservations: Record<string, FreezerReservation> = settings.useFreezer
    ? reserveFreezerSlots(createFreezerPlan(input.freezer, input.householdSize, [...existingCodes, ...fixedCodes]), openSlots, categoryOf, random)
    : {};
  for (const reservation of Object.values(reservations)) used.add(reservation.recipeCode);
  const knownCategoryOf = (key: string | undefined) =>
    key ? (categoryOf(input.existing[key]?.[0]) ?? categoryOf(fixedOf(key)?.recipeCode) ?? categoryOf(reservations[key]?.recipeCode)) : null;

  const meals: GeneratedMeal[] = [];
  let previousCategoryId: string | null = null;
  let sameDayCategoryIds: string[] = [];

  for (const [index, { day, slot, key }] of sequence.entries()) {
    if (index > 0 && sequence[index - 1].day.date !== day.date) sameDayCategoryIds = [];
    const place = (meal: GeneratedMeal, categoryId: string | null) => {
      meals.push(meal);
      previousCategoryId = categoryId;
      if (categoryId) sameDayCategoryIds.push(categoryId);
    };

    if (isKept(key)) {
      place(
        { key, day, slot, recipeCode: null, kept: true, locked: true, reasons: [{ kind: "kept", label: "Déjà rempli dans le planning" }] },
        categoryOf(input.existing[key]?.[0]),
      );
      continue;
    }

    const fixed = fixedOf(key);
    if (fixed) {
      place({ ...fixed, day, slot, kept: false }, categoryOf(fixed.recipeCode));
      continue;
    }

    const reservation = reservations[key];
    if (reservation) {
      place(
        { key, day, slot, recipeCode: reservation.recipeCode, kept: false, locked: false, reasons: [reservation.reason] },
        categoryOf(reservation.recipeCode),
      );
      continue;
    }

    const eligible = dayCandidates(slotPoolOf(slot, key), day.month, settings.season, catalogue);
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
      nextCategoryId: knownCategoryOf(sequence[index + 1]?.key),
      sameDayCategoryIds,
    };
    const choice = chooseRecipe(pool, (recipe) => scoreCandidate(recipe, context), random);

    if (!choice) {
      const label = (input.rejected[key] ?? []).length > 0 ? "Aucune autre recette ne respecte les filtres" : "Aucune recette ne respecte les filtres";
      place({ key, day, slot, recipeCode: null, kept: false, locked: false, reasons: [{ kind: "empty", label }] }, null);
      continue;
    }

    used.add(choice.recipe.code);
    const reasons = fresh.length > 0 ? choice.reasons : [{ kind: "repeat", label: "Répétée faute d'autre recette" } satisfies MealReason, ...choice.reasons];
    place({ key, day, slot, recipeCode: choice.recipe.code, kept: false, locked: false, reasons }, choice.recipe.categoryId);
  }
  return meals;
}
