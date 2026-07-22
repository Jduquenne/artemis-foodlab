import { Food, HouseholdItem } from "../domain/types";
import { Category, replaceCategories } from "../domain/categories";
import { refreshRecipeMacros } from "../../shared/utils/macroUtils";
import { refreshPlannableDb } from "../typed-db/plannableDb";
import { replaceFoodDb, typedFoodDb } from "../typed-db/typedFoodDb";
import { replaceRecipesDb, typedRecipesDb } from "../typed-db/typedRecipesDb";
import { replaceOutdoorDb } from "../typed-db/typedOutdoorDb";
import { replaceHouseholdDb } from "../typed-db/typedHouseholdDb";
import { setRecipeIdMap } from "../typed-db/recipeIdMap";
import {
  ApiOutdoorActivity,
  ApiRecipe,
  mapApiOutdoorActivities,
  mapApiRecipes,
} from "../logic/recipe/recipeApiMapper";
import { apiFetchJson } from "./apiClient";
import * as foodService from "./foodService";
import * as recipesService from "./recipesService";
import * as outdoorService from "./outdoorService";
import * as householdItemsService from "./householdItemsService";
import * as recipeCategoriesService from "./recipeCategoriesService";

function refreshDerivedData(): void {
  refreshPlannableDb();
  refreshRecipeMacros(typedRecipesDb, typedFoodDb);
}

function applyRecipeIdMap(): void {
  setRecipeIdMap(Object.values(typedRecipesDb).map((r) => ({ code: r.code, apiId: r.apiId })));
}

export async function hydrateFromCache(): Promise<void> {
  const [recipes, foods, outdoor, householdItems, categories] = await Promise.all([
    recipesService.getAllAsRecord(),
    foodService.getAllAsRecord(),
    outdoorService.getAllAsRecord(),
    householdItemsService.getAllAsRecord(),
    recipeCategoriesService.getAll(),
  ]);
  if (Object.keys(recipes).length > 0) {
    replaceRecipesDb(recipes);
    applyRecipeIdMap();
  }
  if (Object.keys(foods).length > 0) replaceFoodDb(foods);
  if (Object.keys(outdoor).length > 0) replaceOutdoorDb(outdoor);
  if (Object.keys(householdItems).length > 0) replaceHouseholdDb(householdItems);
  if (categories.length > 0) replaceCategories(categories);
  refreshDerivedData();
}

export async function syncCatalogueFromApi(): Promise<void> {
  try {
    const [apiRecipes, apiOutdoor, apiFoods, apiHouseholdItems, apiCategories] = await Promise.all([
      apiFetchJson<ApiRecipe[]>("/recipes"),
      apiFetchJson<ApiOutdoorActivity[]>("/outdoor-activities"),
      apiFetchJson<Food[]>("/foods"),
      apiFetchJson<HouseholdItem[]>("/household-items"),
      apiFetchJson<Category[]>("/recipe-categories"),
    ]);

    const recipes = mapApiRecipes(apiRecipes);
    const outdoor = mapApiOutdoorActivities(apiOutdoor);
    const foods = Object.fromEntries(apiFoods.map((f) => [f.id, f]));
    const householdItems = Object.fromEntries(apiHouseholdItems.map((h) => [h.id, h]));

    await Promise.all([
      recipesService.bulkPut(recipes),
      outdoorService.bulkPut(outdoor),
      foodService.bulkPut(foods),
      householdItemsService.bulkPut(householdItems),
      recipeCategoriesService.bulkPut(apiCategories),
    ]);

    replaceRecipesDb(recipes);
    applyRecipeIdMap();
    replaceOutdoorDb(outdoor);
    replaceFoodDb(foods);
    replaceHouseholdDb(householdItems);
    replaceCategories(apiCategories);
    refreshDerivedData();
  } catch {
    /* réseau indisponible ou API injoignable, on garde le cache existant */
  }
}
