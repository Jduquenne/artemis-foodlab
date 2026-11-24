import { useMemo } from "react";
import { MacroCatalogue } from "../../core/logic/nutrition/macroLogic";
import { useFoodsSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useAccompanimentStore } from "../store/useAccompanimentStore";

export function useMacroCatalogue(): MacroCatalogue {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const metrics = useRecipeMetricsSnapshot();
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  return useMemo(
    () => ({ recipes, foods, recipeMacros: metrics.macros, baseGrams: metrics.baseGrams, accompaniments }),
    [recipes, foods, metrics, accompaniments],
  );
}
