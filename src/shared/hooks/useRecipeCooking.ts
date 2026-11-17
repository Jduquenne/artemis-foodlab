import { useMemo } from "react";
import { RecipeDetails } from "../../core/domain/recipe";
import { RecipeCookingRow, recipeCookingRows } from "../../core/logic/cooking/recipeCookingLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";
import { useFoodCookings } from "./useFoodCookings";

export function useRecipeCooking(recipe: RecipeDetails | undefined, portions: number): RecipeCookingRow[] {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const cookingsByFood = useFoodCookings();
  return useMemo(
    () => (recipe && cookingsByFood.size > 0 ? recipeCookingRows(recipe, portions, recipes, foods, cookingsByFood) : []),
    [recipe, portions, recipes, foods, cookingsByFood],
  );
}
