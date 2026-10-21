import { useMemo } from "react";
import { seasonalMealIds } from "../../core/logic/season/recipeSeasonLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export interface InSeasonRecipes {
  month: number;
  ids: ReadonlySet<string>;
}

export function useInSeasonRecipes(): InSeasonRecipes {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const month = new Date().getMonth() + 1;
  const ids = useMemo(() => seasonalMealIds(month, { recipes, foods }), [month, recipes, foods]);
  return { month, ids };
}
