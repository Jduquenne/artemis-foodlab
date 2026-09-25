import { useMemo } from "react";
import { MacroCatalogue } from "../utils/macroUtils";
import { useFoodsSnapshot, usePlannableSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useMacroCatalogue(): MacroCatalogue {
  const plannable = usePlannableSnapshot();
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const metrics = useRecipeMetricsSnapshot();
  return useMemo(
    () => ({ plannable, recipes, foods, recipeMacros: metrics.macros, baseGrams: metrics.baseGrams }),
    [plannable, recipes, foods, metrics],
  );
}
