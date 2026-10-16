import { useCallback, useState } from "react";
import { GeneratedMeal, MenuGeneratorSettings } from "../../core/domain/menuGenerator";
import { freezerBatchStocks } from "../../core/logic/freezer/freezerStockLogic";
import { existingMealsByKey } from "../../core/logic/menuGenerator/generatorSettingsLogic";
import { generateMenu, weeksSinceEatenMap } from "../../core/logic/menuGenerator/menuEngineLogic";
import { buildPeriodDays, periodWeeks } from "../../core/logic/menuGenerator/periodLogic";
import { getCategories } from "../../core/services/freezerService";
import { getWeekSlots, syncWeekFromApi } from "../../core/services/planningService";
import { getRecipeUsage } from "../../core/services/planningUsageService";
import { newSeed } from "../../core/utils/randomUtils";
import { useProfileStore } from "../store/useProfileStore";
import { withPending } from "../utils/withPending";
import { useFoodsSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useActiveProfile } from "./useActiveProfile";

export const MENU_GENERATOR_PENDING_KEY = "menu-generator-run";

export interface MenuGeneratorRun {
  settings: MenuGeneratorSettings;
  seed: number;
  meals: GeneratedMeal[];
}

export function useMenuGenerator() {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  const householdSize = useProfileStore((s) => s.profiles.length);
  const activeProfile = useActiveProfile();
  const [run, setRun] = useState<MenuGeneratorRun | null>(null);

  const generate = useCallback(async (settings: MenuGeneratorSettings, seed: number = newSeed()) => {
    await withPending(MENU_GENERATOR_PENDING_KEY, async () => {
      const days = buildPeriodDays(settings.startDate, settings.endDate);
      const weeks = periodWeeks(days);
      await Promise.all(weeks.map((w) => syncWeekFromApi(w.year, w.week)));
      const slots = (await Promise.all(weeks.map((w) => getWeekSlots(w.year, w.week)))).flat();
      const [usage, freezerCategories] = await Promise.all([
        getRecipeUsage().catch(() => []),
        getCategories(),
      ]);
      const meals = generateMenu({
        days,
        settings,
        catalogue: { recipes, foods },
        macros,
        kcalTarget: activeProfile?.kcalTarget ?? null,
        weeksSinceEaten: weeksSinceEatenMap(usage, new Date()),
        existing: existingMealsByKey(slots, days),
        locked: {},
        freezer: freezerBatchStocks(freezerCategories),
        householdSize,
        seed,
      });
      setRun({ settings, seed, meals });
    });
  }, [recipes, foods, macros, activeProfile, householdSize]);

  const reset = useCallback(() => setRun(null), []);

  return { run, generate, reset };
}
