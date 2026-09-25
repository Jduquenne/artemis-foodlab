import { useSyncExternalStore } from "react";
import { Food } from "../../core/domain/ingredient";
import { Category, RecipeDetails } from "../../core/domain/recipe";
import { CatalogueScope, getCatalogueVersion, subscribeCatalogue } from "../../core/typed-db/catalogueEvents";
import { typedCategoriesDb } from "../../core/typed-db/typedCategoriesDb";
import { typedFoodDb } from "../../core/typed-db/typedFoodDb";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";

interface SnapshotSource<T> {
  read: () => T;
}

function createSnapshotSource<T>(scope: CatalogueScope, copy: () => T): SnapshotSource<T> {
  let cache: { version: number; value: T } | null = null;
  return {
    read: () => {
      const version = getCatalogueVersion([scope]);
      if (cache === null || cache.version !== version) cache = { version, value: copy() };
      return cache.value;
    },
  };
}

function useCatalogueSnapshot<T>(source: SnapshotSource<T>): T {
  return useSyncExternalStore(subscribeCatalogue, source.read);
}

const recipesSource = createSnapshotSource("recipes", () => ({ ...typedRecipesDb }));
const foodsSource = createSnapshotSource("foods", () => ({ ...typedFoodDb }));
const categoriesSource = createSnapshotSource("categories", () => [...typedCategoriesDb]);

export const useRecipesSnapshot = (): Record<string, RecipeDetails> => useCatalogueSnapshot(recipesSource);
export const useFoodsSnapshot = (): Record<string, Food> => useCatalogueSnapshot(foodsSource);
export const useCategoriesSnapshot = (): Category[] => useCatalogueSnapshot(categoriesSource);
