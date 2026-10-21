import { useMemo } from "react";
import { MacroCatalogue } from "../../core/logic/nutrition/macroLogic";
import { useFoodsSnapshot, usePlannableSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useAccompanimentStore } from "../store/useAccompanimentStore";

export function useMacroCatalogue(): MacroCatalogue {
  const plannable = usePlannableSnapshot();
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const metrics = useRecipeMetricsSnapshot();
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  return useMemo(
    () => ({ plannable, recipes, foods, recipeMacros: metrics.macros, baseGrams: metrics.baseGrams, accompaniments }),
    [plannable, recipes, foods, metrics, accompaniments],
  );
}
