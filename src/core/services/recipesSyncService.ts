import { Food, RecipeDetails } from "../domain/types";
import { refreshRecipeMacros } from "../../shared/utils/macroUtils";
import { refreshPlannableDb } from "../typed-db/plannableDb";
import { rawFoodDb, replaceFoodDb, typedFoodDb } from "../typed-db/typedFoodDb";
import { rawRecipesDb, replaceRecipesDb, typedRecipesDb } from "../typed-db/typedRecipesDb";
import * as foodService from "./foodService";
import * as recipesService from "./recipesService";

const GATEWAY_URL = import.meta.env.VITE_SHEETS_GATEWAY_URL as string | undefined;

function refreshDerivedData(): void {
  refreshPlannableDb();
  refreshRecipeMacros(typedRecipesDb, typedFoodDb);
}

export async function seedIfEmpty(): Promise<void> {
  const [recipes, foods] = await Promise.all([recipesService.getAll(), foodService.getAll()]);
  if (recipes.length === 0) await recipesService.bulkPut(rawRecipesDb);
  if (foods.length === 0) await foodService.bulkPut(rawFoodDb);
}

export async function hydrateFromCache(): Promise<void> {
  const [recipes, foods] = await Promise.all([recipesService.getAllAsRecord(), foodService.getAllAsRecord()]);
  if (Object.keys(recipes).length > 0) replaceRecipesDb(recipes);
  if (Object.keys(foods).length > 0) replaceFoodDb(foods);
  refreshDerivedData();
}

export async function syncFromGateway(): Promise<void> {
  if (!GATEWAY_URL) return;
  try {
    const [recipesRes, foodsRes] = await Promise.all([
      fetch(`${GATEWAY_URL}/recipes`),
      fetch(`${GATEWAY_URL}/foods`),
    ]);
    let changed = false;
    if (recipesRes.ok) {
      const recipes: Record<string, RecipeDetails> = await recipesRes.json();
      await recipesService.bulkPut(recipes);
      replaceRecipesDb(recipes);
      changed = true;
    }
    if (foodsRes.ok) {
      const foods: Record<string, Food> = await foodsRes.json();
      await foodService.bulkPut(foods);
      replaceFoodDb(foods);
      changed = true;
    }
    if (changed) refreshDerivedData();
  } catch {
    /* réseau indisponible ou Worker injoignable, on garde le cache existant */
  }
}
