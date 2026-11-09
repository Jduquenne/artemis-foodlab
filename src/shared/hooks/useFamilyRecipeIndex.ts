import { useMemo } from "react";
import { FamilyRecipeIndex, familyRecipeIndex } from "../../core/logic/recipe/recipeFoodFilterLogic";
import { useFoodsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useFamilyRecipeIndex(): FamilyRecipeIndex {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  return useMemo(() => familyRecipeIndex(recipes, foods), [recipes, foods]);
}
