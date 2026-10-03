import { useMemo } from "react";
import { TypeMedians, computeTypeMedians } from "../../core/logic/recipe/macroReferenceLogic";
import { useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useTypeMedians(): TypeMedians {
  const recipes = useRecipesSnapshot();
  const { macros } = useRecipeMetricsSnapshot();
  return useMemo(() => computeTypeMedians(recipes, macros), [recipes, macros]);
}
