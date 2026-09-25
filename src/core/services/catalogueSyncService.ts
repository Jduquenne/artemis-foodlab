import { HouseholdItem } from "../domain/household";
import { Food } from "../domain/ingredient";
import { Category } from "../domain/recipe";
import { replaceCategoriesDb } from "../typed-db/typedCategoriesDb";
import { refreshRecipeMacros } from "../../shared/utils/macroUtils";
import { refreshPlannableDb } from "../typed-db/plannableDb";
import { replaceFoodDb, typedFoodDb } from "../typed-db/typedFoodDb";
import { putRecipeInDb, removeRecipeFromDb, replaceRecipesDb, typedRecipesDb } from "../typed-db/typedRecipesDb";
import { replaceOutdoorDb, typedOutdoorDb } from "../typed-db/typedOutdoorDb";
import { replaceHouseholdDb } from "../typed-db/typedHouseholdDb";
import { setRecipeIdMap } from "../typed-db/recipeIdMap";
import { CatalogueScope, notifyCatalogueChange } from "../typed-db/catalogueEvents";
import { CatalogueSignatures, changedScopes } from "../logic/sync/catalogueRefreshLogic";
import {
  ApiOutdoorActivity,
  ApiRecipe,
  mapApiOutdoorActivities,
  mapApiRecipe,
  mapApiRecipes,
} from "../logic/recipe/recipeApiMapper";
import { apiFetchJson } from "./apiClient";
import * as foodService from "./foodService";
import * as recipesService from "./recipesService";
import * as outdoorService from "./outdoorService";
import * as householdItemsService from "./householdItemsService";
import * as recipeCategoriesService from "./recipeCategoriesService";

let lastSignatures: CatalogueSignatures = {};
let inflightSync: Promise<void> | null = null;

function refreshDerivedData(): void {
  refreshPlannableDb();
  refreshRecipeMacros(typedRecipesDb, typedFoodDb);
}

function applyRecipeIdMap(): void {
  const entries = [...Object.values(typedRecipesDb), ...Object.values(typedOutdoorDb)]
    .map((r) => ({ code: r.code, apiId: r.apiId }));
  setRecipeIdMap(entries);
}

export async function hydrateFromCache(): Promise<void> {
  const [recipes, foods, outdoor, householdItems, categories] = await Promise.all([
    recipesService.getAllAsRecord(),
    foodService.getAllAsRecord(),
    outdoorService.getAllAsRecord(),
    householdItemsService.getAllAsRecord(),
    recipeCategoriesService.getAll(),
  ]);
  if (Object.keys(recipes).length > 0) replaceRecipesDb(recipes);
  if (Object.keys(foods).length > 0) replaceFoodDb(foods);
  if (Object.keys(outdoor).length > 0) replaceOutdoorDb(outdoor);
  if (Object.keys(householdItems).length > 0) replaceHouseholdDb(householdItems);
  if (categories.length > 0) replaceCategoriesDb(categories);
  if (Object.keys(recipes).length > 0 || Object.keys(outdoor).length > 0) applyRecipeIdMap();
  refreshDerivedData();
  notifyCatalogueChange("recipes", "foods", "categories", "outdoor", "household");
}

export async function applyCatalogueData(
  apiRecipes: ApiRecipe[],
  apiOutdoor: ApiOutdoorActivity[],
  apiFoods: Food[],
  apiHouseholdItems: HouseholdItem[],
  apiCategories: Category[],
): Promise<void> {
  const signatures: Record<CatalogueScope, string> = {
    recipes: JSON.stringify(apiRecipes),
    outdoor: JSON.stringify(apiOutdoor),
    foods: JSON.stringify(apiFoods),
    household: JSON.stringify(apiHouseholdItems),
    categories: JSON.stringify(apiCategories),
  };
  const changed = changedScopes(lastSignatures, signatures);
  lastSignatures = signatures;
  if (changed.length === 0) return;

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
  replaceOutdoorDb(outdoor);
  replaceFoodDb(foods);
  replaceHouseholdDb(householdItems);
  replaceCategoriesDb(apiCategories);
  applyRecipeIdMap();
  refreshDerivedData();
  notifyCatalogueChange(...changed);
}

export interface SyncCatalogueOptions {
  silent?: boolean;
}

async function fetchAndApplyCatalogue(silent: boolean): Promise<void> {
  const options = { suppressGlobalError: silent };
  try {
    const [apiRecipes, apiOutdoor, apiFoods, apiHouseholdItems, apiCategories] = await Promise.all([
      apiFetchJson<ApiRecipe[]>("/recipes", options),
      apiFetchJson<ApiOutdoorActivity[]>("/outdoor-activities", options),
      apiFetchJson<Food[]>("/foods", options),
      apiFetchJson<HouseholdItem[]>("/household-items", options),
      apiFetchJson<Category[]>("/recipe-categories", options),
    ]);

    await applyCatalogueData(apiRecipes, apiOutdoor, apiFoods, apiHouseholdItems, apiCategories);
  } catch {
    /* réseau indisponible ou API injoignable, on garde le cache existant */
  }
}

export function syncCatalogueFromApi(options: SyncCatalogueOptions = {}): Promise<void> {
  const silent = options.silent ?? false;
  if (inflightSync && silent) return inflightSync;
  const current: Promise<void> = (inflightSync ?? Promise.resolve())
    .then(() => fetchAndApplyCatalogue(silent))
    .finally(() => {
      if (inflightSync === current) inflightSync = null;
    });
  inflightSync = current;
  return current;
}

function codeByApiIdFromCache(): Map<string, string> {
  const map = new Map<string, string>();
  for (const recipe of Object.values(typedRecipesDb)) {
    if (recipe.apiId) map.set(recipe.apiId, recipe.code);
  }
  return map;
}

export async function syncRecipeFromApi(uuid: string): Promise<void> {
  try {
    const api = await apiFetchJson<ApiRecipe>(`/recipes/${uuid}`);
    const codeByApiId = codeByApiIdFromCache();
    codeByApiId.set(api.id, api.code);
    const recipe = mapApiRecipe(api, codeByApiId);
    await recipesService.put(recipe.code, recipe);
    putRecipeInDb(recipe.code, recipe);
    applyRecipeIdMap();
    refreshDerivedData();
    notifyCatalogueChange("recipes");
  } catch {
    /* réseau indisponible ou API injoignable, on garde le cache existant */
  }
}

export async function removeRecipeFromCatalogue(code: string): Promise<void> {
  try {
    await recipesService.remove(code);
  } catch {
    /* échec de suppression du cache local, non bloquant */
  }
  removeRecipeFromDb(code);
  applyRecipeIdMap();
  refreshDerivedData();
  notifyCatalogueChange("recipes");
}
