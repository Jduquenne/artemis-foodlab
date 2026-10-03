import { useMemo } from "react";
import { PredefinedFilter } from "../../core/domain/recipe";
import { computeMacroMedians } from "../../core/logic/recipe/macroReferenceLogic";
import { buildPredefinedFilters } from "../../core/logic/recipe/predefinedFilterLogic";
import { useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export function usePredefinedFilters(): PredefinedFilter[] {
  const recipes = useRecipesSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  return useMemo(() => buildPredefinedFilters(computeMacroMedians(recipes, macros)), [recipes, macros]);
}
