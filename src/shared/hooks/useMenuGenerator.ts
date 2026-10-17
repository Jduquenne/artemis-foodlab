import { useCallback, useState } from "react";
import { GeneratedMeal, MenuGeneratorSettings, PeriodDay } from "../../core/domain/menuGenerator";
import { BulkPlanningResult } from "../../core/domain/planning";
import { FreezerBatchStock, freezerBatchStocks, getFoodIdsInFreezer } from "../../core/logic/freezer/freezerStockLogic";
import { existingMealsByKey } from "../../core/logic/menuGenerator/generatorSettingsLogic";
import { generateMenu, weeksSinceEatenMap } from "../../core/logic/menuGenerator/menuEngineLogic";
import {
  lockedMealsByKey,
  mealsAroundByKey,
  rejectedForMeal,
  toggleMealLock,
} from "../../core/logic/menuGenerator/menuPreviewLogic";
import { plannedEntries } from "../../core/logic/menuGenerator/menuWriteLogic";
import { buildPeriodDays, periodWeeks } from "../../core/logic/menuGenerator/periodLogic";
import { getCategories } from "../../core/services/freezerService";
import { bulkAddPlanningItems, getWeekSlots, syncWeekFromApi } from "../../core/services/planningService";
import { getRecipeUsage } from "../../core/services/planningUsageService";
import { newSeed } from "../../core/utils/randomUtils";
import { useProfileStore } from "../store/useProfileStore";
import { withPending } from "../utils/withPending";
import { useCategoriesSnapshot, useFoodGroupsSnapshot, useFoodsSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useActiveProfile } from "./useActiveProfile";

export const MENU_GENERATOR_PENDING_KEY = "menu-generator-run";

export const MENU_GENERATOR_WRITE_PENDING_KEY = "menu-generator-write";

export interface MenuGeneratorContext {
  days: PeriodDay[];
  existing: Record<string, string[]>;
  weeksSinceEaten: Record<string, number>;
  freezer: FreezerBatchStock[];
  frozenFoodIds: string[];
}

export interface MenuGeneratorRun {
  settings: MenuGeneratorSettings;
  context: MenuGeneratorContext;
  seed: number;
  meals: GeneratedMeal[];
  warnings: string[];
}

async function loadGeneratorContext(settings: MenuGeneratorSettings): Promise<MenuGeneratorContext> {
  const days = buildPeriodDays(settings.startDate, settings.endDate);
  const weeks = periodWeeks(days);
  await Promise.all(weeks.map((w) => syncWeekFromApi(w.year, w.week)));
  const slots = (await Promise.all(weeks.map((w) => getWeekSlots(w.year, w.week)))).flat();
  const [usage, freezerCategories] = await Promise.all([
    getRecipeUsage().catch(() => []),
    getCategories(),
  ]);
  return {
    days,
    existing: existingMealsByKey(slots, days),
    weeksSinceEaten: weeksSinceEatenMap(usage, new Date()),
    freezer: freezerBatchStocks(freezerCategories),
    frozenFoodIds: [...getFoodIdsInFreezer(freezerCategories)],
  };
}

export function useMenuGenerator() {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const categories = useCategoriesSnapshot();
  const groups = useFoodGroupsSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  const householdSize = useProfileStore((s) => s.profiles.length);
  const activeProfile = useActiveProfile();
  const [run, setRun] = useState<MenuGeneratorRun | null>(null);

  const compute = useCallback((
    settings: MenuGeneratorSettings,
    context: MenuGeneratorContext,
    fixed: Record<string, GeneratedMeal>,
    rejected: Record<string, string[]>,
    seed: number,
  ): MenuGeneratorRun => ({
    settings,
    context,
    seed,
    ...generateMenu({
      days: context.days,
      settings,
      catalogue: { recipes, foods, seasonExemptFoodIds: new Set(context.frozenFoodIds) },
      categoryNames: Object.fromEntries(categories.map((category) => [category.id, category.name])),
      groupNames: Object.fromEntries(groups.map((group) => [group.id, group.name])),
      macros,
      kcalTarget: activeProfile?.kcalTarget ?? null,
      weeksSinceEaten: context.weeksSinceEaten,
      existing: context.existing,
      fixed,
      rejected,
      freezer: context.freezer,
      householdSize,
      seed,
    }),
  }), [recipes, foods, categories, groups, macros, activeProfile, householdSize]);

  const generate = useCallback(async (settings: MenuGeneratorSettings) => {
    await withPending(MENU_GENERATOR_PENDING_KEY, async () => {
      const context = await loadGeneratorContext(settings);
      setRun(compute(settings, context, {}, {}, newSeed()));
    });
  }, [compute]);

  const reshuffle = useCallback(() => {
    if (!run) return;
    setRun(compute(run.settings, run.context, lockedMealsByKey(run.meals), {}, newSeed()));
  }, [run, compute]);

  const regenerateMeal = useCallback((key: string) => {
    if (!run) return;
    setRun(compute(run.settings, run.context, mealsAroundByKey(run.meals, key), rejectedForMeal(run.meals, key), newSeed()));
  }, [run, compute]);

  const toggleLock = useCallback((key: string) => {
    setRun((current) => (current ? { ...current, meals: toggleMealLock(current.meals, key) } : current));
  }, []);

  const write = useCallback(async (): Promise<BulkPlanningResult | undefined> => {
    if (!run) return undefined;
    const entries = plannedEntries(run.meals);
    return withPending(MENU_GENERATOR_WRITE_PENDING_KEY, () => bulkAddPlanningItems(entries));
  }, [run]);

  return { run, generate, reshuffle, regenerateMeal, toggleLock, write };
}
