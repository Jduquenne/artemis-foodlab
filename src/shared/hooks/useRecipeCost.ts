import { useMemo } from "react";
import { RecipeDetails } from "../../core/domain/recipe";
import { RecipeCost, recipeCost } from "../../core/logic/price/recipeCostLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useFoodPrices } from "./useFoodPrices";

export function useRecipeCost(recipe: RecipeDetails | undefined, portions: number): RecipeCost | null {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const { store, priceByFood } = useFoodPrices();
  return useMemo(
    () => (recipe && store && priceByFood.size > 0 ? recipeCost(recipe, portions, recipes, foods, priceByFood) : null),
    [recipe, portions, recipes, foods, store, priceByFood],
  );
}
