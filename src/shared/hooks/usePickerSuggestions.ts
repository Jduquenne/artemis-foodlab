import { useEffect, useMemo, useState } from "react";
import { SlotType } from "../../core/domain/planning";
import { RecipeUsageItem } from "../../core/domain/planningUsage";
import { PickerSuggestionSection, pickerSuggestions } from "../../core/logic/planning/pickerSuggestionLogic";
import { getRecipeUsage } from "../../core/services/planningUsageService";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useInSeasonRecipes } from "./useInSeasonRecipes";

const NO_SEASON: ReadonlySet<string> = new Set();

export function usePickerSuggestions(slot: SlotType): PickerSuggestionSection[] {
  const recipes = useRecipesSnapshot();
  const { ids: seasonalIds } = useInSeasonRecipes();
  const [usage, setUsage] = useState<RecipeUsageItem[]>([]);

  useEffect(() => {
    let active = true;
    getRecipeUsage([slot])
      .then((items) => {
        if (active) setUsage(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slot]);

  const withSeason = slot === "lunch" || slot === "dinner";
  return useMemo(
    () => pickerSuggestions(usage, recipes, withSeason ? seasonalIds : NO_SEASON),
    [usage, recipes, seasonalIds, withSeason],
  );
}
