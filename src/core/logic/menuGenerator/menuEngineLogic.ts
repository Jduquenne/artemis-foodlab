import {
  GENERATED_SLOTS,
  GENERATED_SLOT_LABELS,
  GeneratedMeal,
  GeneratedSlotType,
  MealReason,
  MenuGenerationResult,
  MenuGeneratorSettings,
  PeriodDay,
  RecipeDietProfile,
} from "../../domain/menuGenerator";
import { Macronutrients } from "../../domain/nutrition";
import { RecipeUsageItem } from "../../domain/planningUsage";
import { RecipeDetails } from "../../domain/recipe";
import { createSeededRandom, pickRandom } from "../../utils/randomUtils";
import { formatSourceDayFull } from "../../utils/dateUtils";
import { weeksSinceIsoWeek } from "../../utils/weekUtils";
import { MenuCatalogue, dayCandidates, recipeDietProfile, slotCandidates } from "./candidateLogic";
import { HabitMatcher, SlotHabits, habitLabel, respectsStrictHabits, slotHabits } from "./habitLogic";
import { FreezerBatchStock } from "../freezer/freezerStockLogic";
import { FreezerReservation, OpenSlot, createFreezerPlan, reserveFreezerSlots } from "./freezerPlanLogic";
import { scoreCandidate } from "./mealScoreLogic";
import { assignPreferredFoods, createFoodIndex, preferredFoodReason } from "./preferredFoodLogic";

export interface MenuEngineInput {
  days: readonly PeriodDay[];
  settings: MenuGeneratorSettings;
  catalogue: MenuCatalogue;
  categoryNames: Record<string, string>;
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

export function generateMenu(input: MenuEngineInput): MenuGenerationResult {
  const { days, settings, catalogue } = input;
  const random = createSeededRandom(input.seed);
  const candidatesBySlot = new Map(settings.slots.map((slot) => [slot, slotCandidates(catalogue, slot, settings)]));
  const fixedCodes = Object.values(input.fixed)
    .map((meal) => meal.recipeCode)
    .filter((code): code is string => code !== null);
  const existingCodes = Object.values(input.existing).flat();
  const used = new Set([...existingCodes, ...fixedCodes]);
  const categoryOf = (code: string | null | undefined) => (code ? (catalogue.recipes[code]?.categoryId ?? null) : null);
  const foodsOf = createFoodIndex(catalogue);
  const dietCache = new Map<string, RecipeDietProfile>();
  const matcher: HabitMatcher = {
    foodsOf: (code) => foodsOf(code),
    dietOf: (code) => {
      const cached = dietCache.get(code);
      if (cached) return cached;
      const recipe = catalogue.recipes[code];
      const diet = recipe
        ? recipeDietProfile(recipe, catalogue.recipes)
        : { hasMeat: false, hasFish: false, hasRedMeat: false, hasWhiteMeat: false, hasDeli: false };
      dietCache.set(code, diet);
      return diet;
    },
  };
  const names = { catalogue, categoryNames: input.categoryNames };

  const sequence = days.flatMap((day) => settings.slots.map((slot) => ({ day, slot, key: mealKey(day.date, slot) })));
  const habitsByKey = new Map<string, SlotHabits>(sequence.map(({ day, slot, key }) => [key, slotHabits(settings.habits, day.day, slot)]));
  const noHabits = slotHabits([], "", GENERATED_SLOTS[0]);
  const habitsOf = (key: string) => habitsByKey.get(key) ?? noHabits;
  const slotPoolOf = (slot: GeneratedSlotType, key: string) => {
    const rejected = input.rejected[key] ?? [];
    const habits = habitsOf(key);
    return (candidatesBySlot.get(slot) ?? []).filter(
      (recipe) => !rejected.includes(recipe.code) && respectsStrictHabits(recipe, habits, matcher),
    );
  };
  const isKept = (key: string) => (input.existing[key]?.length ?? 0) > 0;
  const fixedOf = (key: string) => {
    const fixed = input.fixed[key];
    return fixed && (fixed.recipeCode === null || catalogue.recipes[fixed.recipeCode]) ? fixed : null;
  };
  const openSlots: OpenSlot[] = sequence.flatMap(({ day, slot, key }, index) =>
    !isKept(key) && !fixedOf(key) && !habitsOf(key).noMeal
      ? [{ key, index, date: day.date, candidateCodes: new Set(slotPoolOf(slot, key).map((recipe) => recipe.code)) }]
      : [],
  );
  const reservations: Record<string, FreezerReservation> = settings.useFreezer
    ? reserveFreezerSlots(createFreezerPlan(input.freezer, input.householdSize, [...existingCodes, ...fixedCodes]), openSlots, categoryOf, random)
    : {};
  for (const reservation of Object.values(reservations)) used.add(reservation.recipeCode);
  const preferredReasonOf = (code: string) => {
    const reason = preferredFoodReason(foodsOf(code), settings.preferredFoods, catalogue);
    return reason ? [reason] : null;
  };
  const covered = new Set<string>();
  const cover = (code: string | null | undefined) => foodsOf(code).forEach((id) => covered.add(id));
  [...existingCodes, ...fixedCodes, ...Object.values(reservations).map((r) => r.recipeCode)].forEach(cover);
  const required = new Set(settings.preferredFoods.filter((item) => item.mode === "atLeastOnce").map((item) => item.foodId));
  const toPlace = settings.preferredFoods.filter((item) => !covered.has(item.foodId)).map((item) => item.foodId);
  const eligibleOf = (day: PeriodDay, slot: GeneratedSlotType, key: string) =>
    dayCandidates(slotPoolOf(slot, key), day.month, settings.season, catalogue);
  const preferredFoodBySlot = assignPreferredFoods(
    toPlace,
    sequence
      .filter(({ key }) => !isKept(key) && !fixedOf(key) && !reservations[key] && !habitsOf(key).noMeal)
      .map(({ day, slot, key }) => ({ key, candidates: eligibleOf(day, slot, key) })),
    (code) => foodsOf(code),
    random,
  );
  const knownCategoryOf = (key: string | undefined) =>
    key ? (categoryOf(input.existing[key]?.[0]) ?? categoryOf(fixedOf(key)?.recipeCode) ?? categoryOf(reservations[key]?.recipeCode)) : null;

  const meals: GeneratedMeal[] = [];
  const warnings: string[] = [];
  let previousCategoryId: string | null = null;
  let sameDayCategoryIds: string[] = [];

  for (const [index, { day, slot, key }] of sequence.entries()) {
    if (index > 0 && sequence[index - 1].day.date !== day.date) sameDayCategoryIds = [];
    const place = (meal: GeneratedMeal, categoryId: string | null) => {
      meals.push(meal);
      cover(meal.kept ? input.existing[key]?.[0] : meal.recipeCode);
      previousCategoryId = categoryId;
      if (categoryId) sameDayCategoryIds.push(categoryId);
    };

    if (isKept(key)) {
      place(
        { key, day, slot, recipeCode: null, kept: true, locked: true, noMeal: false, reasons: [{ kind: "kept", label: "Déjà rempli dans le planning" }] },
        categoryOf(input.existing[key]?.[0]),
      );
      continue;
    }

    const fixed = fixedOf(key);
    if (fixed) {
      place({ ...fixed, day, slot, kept: false }, categoryOf(fixed.recipeCode));
      continue;
    }

    const habits = habitsOf(key);
    if (habits.noMeal) {
      const reason: MealReason = { kind: "habit", label: `Habitude : ${habitLabel(habits.noMeal, names)}` };
      place({ key, day, slot, recipeCode: null, kept: false, locked: false, noMeal: true, reasons: [reason] }, null);
      continue;
    }

    const reservation = reservations[key];
    if (reservation) {
      place(
        {
          key,
          day,
          slot,
          recipeCode: reservation.recipeCode,
          kept: false,
          locked: false,
          noMeal: false,
          reasons: [reservation.reason, ...(preferredReasonOf(reservation.recipeCode) ?? [])],
        },
        categoryOf(reservation.recipeCode),
      );
      continue;
    }

    const targetFood = preferredFoodBySlot[key];
    const pendingFood = targetFood && !covered.has(targetFood) ? targetFood : null;
    const allEligible = eligibleOf(day, slot, key);
    const requiredPool = pendingFood && required.has(pendingFood)
      ? allEligible.filter((recipe) => foodsOf(recipe.code).has(pendingFood))
      : [];
    const eligible = requiredPool.length > 0 ? requiredPool : allEligible;
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
      preferredFoods: settings.preferredFoods,
      bonusFoodId: pendingFood,
      foodsOf: (code: string) => foodsOf(code),
      habits,
      matcher,
      names,
    };
    const choice = chooseRecipe(pool, (recipe) => scoreCandidate(recipe, context), random);

    if (!choice) {
      const strict = [...habits.mandatory, ...habits.forbidden];
      const strictLabel = strict.map((rule) => habitLabel(rule, names)).join(" + ");
      const label = strict.length > 0
        ? `Aucune recette ne respecte les habitudes : ${strictLabel}`
        : (input.rejected[key] ?? []).length > 0
          ? "Aucune autre recette ne respecte les filtres"
          : "Aucune recette ne respecte les filtres";
      if (strict.length > 0) {
        warnings.push(`${formatSourceDayFull(day.date)}, ${GENERATED_SLOT_LABELS[slot].toLowerCase()} : aucune recette ne respecte les habitudes ${strictLabel}.`);
      }
      place({ key, day, slot, recipeCode: null, kept: false, locked: false, noMeal: false, reasons: [{ kind: "empty", label }] }, null);
      continue;
    }

    used.add(choice.recipe.code);
    const reasons = fresh.length > 0 ? choice.reasons : [{ kind: "repeat", label: "Répétée faute d'autre recette" } satisfies MealReason, ...choice.reasons];
    place({ key, day, slot, recipeCode: choice.recipe.code, kept: false, locked: false, noMeal: false, reasons }, choice.recipe.categoryId);
  }
  for (const foodId of required) {
    if (covered.has(foodId)) continue;
    const name = catalogue.foods[foodId]?.name ?? foodId;
    warnings.push(`« ${name} » n'a pas pu être utilisé : aucune recette compatible avec les filtres sur les créneaux libres.`);
  }
  return { meals, warnings };
}
