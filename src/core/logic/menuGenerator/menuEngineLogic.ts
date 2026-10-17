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
import { kcalDeviation, scoreCandidate, slotKcalTarget } from "./mealScoreLogic";
import { assignToRandomSlots, createFoodIndex, preferredFoodReason } from "./preferredFoodLogic";
import {
  QuotaBlock,
  assignQuotaSlots,
  matchesQuota,
  quotaCounterKey,
  quotaLabel,
  quotaScore,
  quotaTarget,
  periodBlocks,
} from "./quotaLogic";

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
  const freeSlots = sequence
    .filter(({ key }) => !isKept(key) && !fixedOf(key) && !reservations[key] && !habitsOf(key).noMeal)
    .map(({ day, slot, key }) => ({ key, candidates: eligibleOf(day, slot, key) }));
  const preferredFoodBySlot = assignToRandomSlots(toPlace, freeSlots, (recipe, foodId) => foodsOf(recipe.code).has(foodId), random);
  const favoriteCodes = new Set(settings.favoriteRecipeCodes);
  const placedCodes = new Set([...existingCodes, ...fixedCodes, ...Object.values(reservations).map((r) => r.recipeCode)]);
  const favoriteBySlot = assignToRandomSlots(
    settings.favoriteRecipeCodes.filter((code) => !placedCodes.has(code)),
    freeSlots,
    (recipe, code) => recipe.code === code,
    random,
  );
  const advanced = settings.advanced;
  const quotas = settings.quotas.filter((quota) => quota.enabled);
  const codesOfKey = (key: string): string[] => {
    if (isKept(key)) return input.existing[key] ?? [];
    const code = fixedOf(key)?.recipeCode ?? reservations[key]?.recipeCode ?? null;
    return code ? [code] : [];
  };
  const countInto = (counts: Map<string, number>, codes: readonly string[], blockKey: string) => {
    for (const quota of quotas) {
      if (!codes.some((code) => catalogue.recipes[code] && matchesQuota(catalogue.recipes[code], quota, matcher))) continue;
      const counterKey = quotaCounterKey(quota.id, blockKey);
      counts.set(counterKey, (counts.get(counterKey) ?? 0) + 1);
    }
  };
  const knownCounts = new Map<string, number>();
  const blocks = periodBlocks(days);
  const blockKeyOf = (day: PeriodDay) => blocks.get(day.date)?.blockKey ?? "";
  for (const { day, key } of sequence) countInto(knownCounts, codesOfKey(key), blockKeyOf(day));
  const quotaBlocks: QuotaBlock[] = [...new Set(sequence.map(({ day }) => blockKeyOf(day)))].map((blockKey) => {
    const blockSlots = sequence.filter(({ day }) => blockKeyOf(day) === blockKey);
    return {
      blockKey,
      label: blocks.get(blockSlots[0].day.date)?.label ?? blockKey,
      dayCount: new Set(blockSlots.map(({ day }) => day.date)).size,
      slots: blockSlots
        .filter(({ key }) => !isKept(key) && !fixedOf(key) && !reservations[key] && !habitsOf(key).noMeal)
        .map(({ day, slot, key }) => ({ key, date: day.date, candidates: eligibleOf(day, slot, key) })),
    };
  });
  const dayCountOf = (blockKey: string) => quotaBlocks.find((block) => block.blockKey === blockKey)?.dayCount ?? 0;
  const quotaBySlot = assignQuotaSlots(quotas, quotaBlocks, knownCounts, new Set(Object.keys(preferredFoodBySlot)), matcher, random);
  const forcedQuotaIds = new Map<string, Set<string>>(
    sequence
      .filter(({ key }) => !isKept(key) && !fixedOf(key) && !reservations[key] && !habitsOf(key).noMeal)
      .map(({ day, slot, key }) => {
        const pool = eligibleOf(day, slot, key);
        const forced = quotas.filter((quota) => pool.length > 0 && pool.every((recipe) => matchesQuota(recipe, quota, matcher)));
        return [key, new Set(forced.map((quota) => quota.id))];
      }),
  );
  const forcedAfter = (quotaId: string, blockKey: string, index: number) =>
    sequence.filter((entry, position) => position > index && blockKeyOf(entry.day) === blockKey && forcedQuotaIds.get(entry.key)?.has(quotaId)).length;
  const counts = new Map<string, number>();
  const knownCategoryOf = (key: string | undefined) =>
    key ? (categoryOf(input.existing[key]?.[0]) ?? categoryOf(fixedOf(key)?.recipeCode) ?? categoryOf(reservations[key]?.recipeCode)) : null;

  const meals: GeneratedMeal[] = [];
  const warnings: string[] = [];
  let previousCategoryId: string | null = null;
  let sameDayCategoryIds: string[] = [];

  for (const [index, { day, slot, key }] of sequence.entries()) {
    if (index > 0 && sequence[index - 1].day.date !== day.date) sameDayCategoryIds = [];
    const blockKey = blockKeyOf(day);
    const countOf = (quotaId: string) => counts.get(quotaCounterKey(quotaId, blockKey)) ?? 0;
    const place = (meal: GeneratedMeal, categoryId: string | null) => {
      meals.push(meal);
      countInto(counts, meal.kept ? (input.existing[key] ?? []) : meal.recipeCode ? [meal.recipeCode] : [], blockKey);
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
    const nextCategoryId = knownCategoryOf(sequence[index + 1]?.key);
    const kcalTarget = slotKcalTarget(input.kcalTarget, slot, advanced);
    const strictFilters: { label: string; keep: (recipe: RecipeDetails) => boolean }[] = [
      ...(advanced.repeatMode === "strict"
        ? [{
            label: `pas de recette planifiée il y a moins de ${advanced.repeatWeeks} sem.`,
            keep: (recipe: RecipeDetails) => (input.weeksSinceEaten[recipe.code] ?? Infinity) >= advanced.repeatWeeks,
          }]
        : []),
      ...(advanced.categoryInRow === "strict"
        ? [{
            label: "pas deux fois la même catégorie à la suite",
            keep: (recipe: RecipeDetails) => recipe.categoryId !== previousCategoryId && recipe.categoryId !== nextCategoryId,
          }]
        : []),
      ...(advanced.kcalMode === "strict" && kcalTarget
        ? [{
            label: `kcal à ±${advanced.kcalTolerance} % de ${kcalTarget}`,
            keep: (recipe: RecipeDetails) => (kcalDeviation(input.macros[recipe.code]?.kcal, kcalTarget) ?? 0) <= advanced.kcalTolerance / 100,
          }]
        : []),
    ];
    const cappedQuotas = quotas.filter((quota) =>
      quota.comparator === "atMost"
      && quota.strictness === "strict"
      && !forcedQuotaIds.get(key)?.has(quota.id)
      && countOf(quota.id) + forcedAfter(quota.id, blockKey, index) >= quota.count,
    );
    const quotaEligible = eligibleOf(day, slot, key).filter((recipe) => cappedQuotas.every((quota) => !matchesQuota(recipe, quota, matcher)));
    const blockingFilter = strictFilters.find((_filter, position) =>
      quotaEligible.filter((recipe) => strictFilters.slice(0, position + 1).every((f) => f.keep(recipe))).length === 0,
    );
    const allEligible = quotaEligible.filter((recipe) => strictFilters.every((filter) => filter.keep(recipe)));
    const requiredPool = pendingFood && required.has(pendingFood)
      ? allEligible.filter((recipe) => foodsOf(recipe.code).has(pendingFood))
      : [];
    const foodEligible = requiredPool.length > 0 ? requiredPool : allEligible;
    const slotQuota = quotas.find((quota) => quota.id === quotaBySlot[key]);
    const pendingQuota = slotQuota && countOf(slotQuota.id) < quotaTarget(slotQuota, dayCountOf(blockKey)) ? slotQuota : null;
    const quotaPool = pendingQuota && pendingQuota.strictness === "strict"
      ? foodEligible.filter((recipe) => matchesQuota(recipe, pendingQuota, matcher))
      : [];
    const eligible = quotaPool.length > 0 ? quotaPool : foodEligible;
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
      nextCategoryId,
      sameDayCategoryIds,
      preferredFoods: settings.preferredFoods,
      bonusFoodId: pendingFood,
      foodsOf: (code: string) => foodsOf(code),
      habits,
      matcher,
      names,
      advanced,
      favoriteCodes,
      bonusFavoriteCode: favoriteBySlot[key] ?? null,
      quotaAdjust: (recipe: RecipeDetails) => quotaScore(recipe, quotas, pendingQuota?.id ?? null, countOf, matcher, names),
    };
    const choice = chooseRecipe(pool, (recipe) => scoreCandidate(recipe, context), random);

    if (!choice) {
      const strict = [...habits.mandatory, ...habits.forbidden];
      const strictLabel = strict.map((rule) => habitLabel(rule, names)).join(" + ");
      const cappedLabel = cappedQuotas.map((quota) => quotaLabel(quota, names)).join(" + ");
      if (strict.length === 0 && cappedQuotas.length > 0) {
        warnings.push(`${formatSourceDayFull(day.date)}, ${GENERATED_SLOT_LABELS[slot].toLowerCase()} : aucune recette possible sans dépasser ${cappedLabel}.`);
      }
      if (strict.length === 0 && cappedQuotas.length === 0 && blockingFilter && quotaEligible.length > 0) {
        warnings.push(`${formatSourceDayFull(day.date)}, ${GENERATED_SLOT_LABELS[slot].toLowerCase()} : aucune recette ne respecte le réglage strict « ${blockingFilter.label} ».`);
      }
      const label = strict.length > 0
        ? `Aucune recette ne respecte les habitudes : ${strictLabel}`
        : blockingFilter && quotaEligible.length > 0
          ? `Aucune recette ne respecte : ${blockingFilter.label}`
          : cappedQuotas.length > 0
          ? `Aucune recette possible sans dépasser : ${cappedLabel}`
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
  for (const quota of quotas.filter((item) => item.strictness === "strict")) {
    for (const block of quotaBlocks) {
      const count = counts.get(quotaCounterKey(quota.id, block.blockKey)) ?? 0;
      const target = quotaTarget(quota, block.dayCount);
      if (quota.comparator === "atLeast" && count < target) {
        warnings.push(`${block.label} : ${quotaLabel(quota, names)} non atteint (${count} sur ${target}).`);
      }
      if (quota.comparator === "atMost" && count > target) {
        warnings.push(`${block.label} : ${quotaLabel(quota, names)} dépassé (${count}) à cause des repas déjà prévus, gardés ou des habitudes.`);
      }
    }
  }
  for (const foodId of required) {
    if (covered.has(foodId)) continue;
    const name = catalogue.foods[foodId]?.name ?? foodId;
    warnings.push(`« ${name} » n'a pas pu être utilisé : aucune recette compatible avec les filtres sur les créneaux libres.`);
  }
  return { meals, warnings };
}
