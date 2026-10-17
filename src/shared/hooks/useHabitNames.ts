import { useMemo } from "react";
import { FoodList } from "../../core/domain/menuGenerator";
import { HabitNames } from "../../core/logic/menuGenerator/habitLogic";
import { useCategoriesSnapshot, useFoodGroupsSnapshot, useFoodsSnapshot, useRecipesSnapshot } from "./useCatalogueSnapshot";

export function useHabitNames(lists: readonly FoodList[]): HabitNames {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const categories = useCategoriesSnapshot();
  const groups = useFoodGroupsSnapshot();
  return useMemo(
    () => ({
      catalogue: { recipes, foods },
      categoryNames: Object.fromEntries(categories.map((category) => [category.id, category.name])),
      groupNames: Object.fromEntries(groups.map((group) => [group.id, group.name])),
      lists,
    }),
    [recipes, foods, categories, groups, lists],
  );
}
