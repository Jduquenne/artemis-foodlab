import { useSyncExternalStore } from "react";
import { HouseholdItem } from "../../core/domain/household";
import { Food } from "../../core/domain/ingredient";
import { Category, OutdoorEntry, PlannableItem, RecipeDetails } from "../../core/domain/recipe";
import { CatalogueScope, getCatalogueVersion, subscribeCatalogue } from "../../core/catalogue/catalogueEvents";
import { categoriesCatalogue } from "../../core/catalogue/categories";
import { foodsCatalogue } from "../../core/catalogue/foods";
import { outdoorCatalogue } from "../../core/catalogue/outdoor";
import { householdCatalogue } from "../../core/catalogue/household";
import { buildPlannableItems } from "../../core/catalogue/plannable";
import { recipesCatalogue } from "../../core/catalogue/recipes";
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

const recipesSource = createSnapshotSource(["recipes"], () => ({ ...recipesCatalogue }));
const foodsSource = createSnapshotSource(["foods"], () => ({ ...foodsCatalogue }));
const categoriesSource = createSnapshotSource(["categories"], () => [...categoriesCatalogue]);
const householdSource = createSnapshotSource(["household"], () => ({ ...householdCatalogue }));
const outdoorSource = createSnapshotSource(["outdoor"], () => ({ ...outdoorCatalogue }));
const plannableSource = createSnapshotSource(["recipes", "outdoor"], buildPlannableItems);
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
export const useHouseholdSnapshot = (): Record<string, HouseholdItem> => useCatalogueSnapshot(householdSource);
export const useOutdoorSnapshot = (): Record<string, OutdoorEntry> => useCatalogueSnapshot(outdoorSource);
export const useCategoriesSnapshot = (): Category[] => useCatalogueSnapshot(categoriesSource);
export const usePlannableSnapshot = (): Record<string, PlannableItem> => useCatalogueSnapshot(plannableSource);
export const useRecipeMetricsSnapshot = (): RecipeMetricsSnapshot => useCatalogueSnapshot(recipeMetricsSource);
