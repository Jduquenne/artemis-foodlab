import { useMemo } from "react";
import { Ingredient } from "../../core/domain/ingredient";
import { groupIngredientsOf } from "../../core/logic/foodGroup/foodChoiceLogic";
import { useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useGroupIngredients(recipeId: string | undefined): Ingredient[] {
  const recipes = useRecipesSnapshot();
  const recipe = recipeId ? recipes[recipeId] : undefined;
  return useMemo(() => groupIngredientsOf(recipe), [recipe]);
}
