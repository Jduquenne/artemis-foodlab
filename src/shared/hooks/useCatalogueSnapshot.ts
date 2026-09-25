import { useSyncExternalStore } from "react";
import { Food } from "../../core/domain/ingredient";
import { Category, RecipeDetails } from "../../core/domain/recipe";
import { CatalogueScope, getCatalogueVersion, subscribeCatalogue } from "../../core/typed-db/catalogueEvents";
import { typedCategoriesDb } from "../../core/typed-db/typedCategoriesDb";
import { typedFoodDb } from "../../core/typed-db/typedFoodDb";
import { buildPlannableDb } from "../../core/typed-db/plannableDb";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { Macronutrients } from "../../core/domain/nutrition";
import { RECIPE_BASE_GRAMS, RECIPE_MACROS } from "../utils/macroUtils";

interface SnapshotSource<T> {
  read: () => T;
}

function createSnapshotSource<T>(scopes: readonly CatalogueScope[], copy: () => T): SnapshotSource<T> {
  let cache: { version: number; value: T } | null = null;
  return {
    read: () => {
      const version = getCatalogueVersion(scopes);
      if (cache === null || cache.version !== version) cache = { version, value: copy() };
      return cache.value;
    },
  };
}

function useCatalogueSnapshot<T>(source: SnapshotSource<T>): T {
  return useSyncExternalStore(subscribeCatalogue, source.read);
}

const recipesSource = createSnapshotSource(["recipes"], () => ({ ...typedRecipesDb }));
const foodsSource = createSnapshotSource(["foods"], () => ({ ...typedFoodDb }));
const categoriesSource = createSnapshotSource(["categories"], () => [...typedCategoriesDb]);
const plannableSource = createSnapshotSource(["recipes", "outdoor"], buildPlannableDb);
const recipeMetricsSource = createSnapshotSource(["recipes", "foods"], () => ({
  macros: { ...RECIPE_MACROS },
  baseGrams: { ...RECIPE_BASE_GRAMS },
}));

export interface RecipeMetricsSnapshot {
  macros: Record<string, Macronutrients>;
  baseGrams: Record<string, number>;
}

export const useRecipesSnapshot = (): Record<string, RecipeDetails> => useCatalogueSnapshot(recipesSource);
export const useFoodsSnapshot = (): Record<string, Food> => useCatalogueSnapshot(foodsSource);
export const useCategoriesSnapshot = (): Category[] => useCatalogueSnapshot(categoriesSource);
export const usePlannableSnapshot = (): Record<string, RecipeDetails> => useCatalogueSnapshot(plannableSource);
export const useRecipeMetricsSnapshot = (): RecipeMetricsSnapshot => useCatalogueSnapshot(recipeMetricsSource);
