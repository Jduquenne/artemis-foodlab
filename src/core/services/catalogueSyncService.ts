import { HouseholdItem } from "../domain/household";
import { FoodGroup } from "../domain/foodGroup";
import { Food } from "../domain/ingredient";
import { Category } from "../domain/recipe";
import { replaceCategories } from "../catalogue/categories";
import { replaceFoodGroups } from "../catalogue/foodGroups";
import { refreshRecipeMacros } from "../catalogue/recipeMetrics";
import { replaceFoods, foodsCatalogue } from "../catalogue/foods";
import { putRecipe, removeRecipe, replaceRecipes, recipesCatalogue } from "../catalogue/recipes";
import { replaceOutdoor, outdoorCatalogue } from "../catalogue/outdoor";
import { replaceHousehold } from "../catalogue/household";
import { setRecipeIdMap } from "../catalogue/recipeIdMap";
import { CatalogueScope, notifyCatalogueChange } from "../catalogue/catalogueEvents";
import { CatalogueSignatures, changedScopes } from "../logic/sync/catalogueRefreshLogic";
import {
  ApiOutdoorActivity,
  ApiRecipe,
  mapApiOutdoorActivities,
  mapApiRecipe,
  mapApiRecipes,
} from "../logic/recipe/recipeApiMapper";
import { apiFetchJson } from "./apiClient";
import { putCachedRecipe, readCatalogueCache, removeCachedRecipe, writeCatalogueCache } from "./catalogueCacheService";

let lastSignatures: CatalogueSignatures = {};
let inflightSync: Promise<void> | null = null;

function refreshDerivedData(): void {
  refreshRecipeMacros(recipesCatalogue, foodsCatalogue);
}

function applyRecipeIdMap(): void {
  const entries = [...Object.values(recipesCatalogue), ...Object.values(outdoorCatalogue)]
    .map((r) => ({ code: r.code, apiId: r.apiId }));
  setRecipeIdMap(entries);
}

export async function hydrateFromCache(): Promise<void> {
  const { recipes, foods, outdoor, householdItems, categories, foodGroups } = await readCatalogueCache();
  if (Object.keys(recipes).length > 0) replaceRecipes(recipes);
  if (Object.keys(foods).length > 0) replaceFoods(foods);
  if (Object.keys(outdoor).length > 0) replaceOutdoor(outdoor);
  if (Object.keys(householdItems).length > 0) replaceHousehold(householdItems);
  if (categories.length > 0) replaceCategories(categories);
  if (foodGroups.length > 0) replaceFoodGroups(foodGroups);
  if (Object.keys(recipes).length > 0 || Object.keys(outdoor).length > 0) applyRecipeIdMap();
  refreshDerivedData();
  notifyCatalogueChange("recipes", "foods", "categories", "outdoor", "household", "foodGroups");
}

export async function applyCatalogueData(
  apiRecipes: ApiRecipe[],
  apiOutdoor: ApiOutdoorActivity[],
  apiFoods: Food[],
  apiHouseholdItems: HouseholdItem[],
  apiCategories: Category[],
  apiFoodGroups: FoodGroup[],
): Promise<void> {
  const signatures: Record<CatalogueScope, string> = {
    recipes: JSON.stringify(apiRecipes),
    outdoor: JSON.stringify(apiOutdoor),
    foods: JSON.stringify(apiFoods),
    household: JSON.stringify(apiHouseholdItems),
    categories: JSON.stringify(apiCategories),
    foodGroups: JSON.stringify(apiFoodGroups),
  };
  const changed = changedScopes(lastSignatures, signatures);
  lastSignatures = signatures;
  if (changed.length === 0) return;

  const recipes = mapApiRecipes(apiRecipes);
  const outdoor = mapApiOutdoorActivities(apiOutdoor);
  const foods = Object.fromEntries(apiFoods.map((f) => [f.id, f]));
  const householdItems = Object.fromEntries(apiHouseholdItems.map((h) => [h.id, h]));

  await writeCatalogueCache({ recipes, foods, outdoor, householdItems, categories: apiCategories, foodGroups: apiFoodGroups });

  replaceRecipes(recipes);
  replaceOutdoor(outdoor);
  replaceFoods(foods);
  replaceHousehold(householdItems);
  replaceCategories(apiCategories);
  replaceFoodGroups(apiFoodGroups);
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
    const [apiRecipes, apiOutdoor, apiFoods, apiHouseholdItems, apiCategories, apiFoodGroups] = await Promise.all([
      apiFetchJson<ApiRecipe[]>("/recipes", options),
      apiFetchJson<ApiOutdoorActivity[]>("/outdoor-activities", options),
      apiFetchJson<Food[]>("/foods", options),
      apiFetchJson<HouseholdItem[]>("/household-items", options),
      apiFetchJson<Category[]>("/recipe-categories", options),
      apiFetchJson<FoodGroup[]>("/food-groups", options),
    ]);

    await applyCatalogueData(apiRecipes, apiOutdoor, apiFoods, apiHouseholdItems, apiCategories, apiFoodGroups);
  } catch {
    return;
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
  for (const recipe of Object.values(recipesCatalogue)) {
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
    await putCachedRecipe(recipe.code, recipe);
    putRecipe(recipe.code, recipe);
    applyRecipeIdMap();
    refreshDerivedData();
    notifyCatalogueChange("recipes");
  } catch {
    return;
  }
}

export async function removeRecipeFromCatalogue(code: string): Promise<void> {
  await removeCachedRecipe(code).catch(() => undefined);
  removeRecipe(code);
  applyRecipeIdMap();
  refreshDerivedData();
  notifyCatalogueChange("recipes");
}
