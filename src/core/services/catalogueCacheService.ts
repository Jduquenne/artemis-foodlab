import { Table } from "dexie";
import { FoodGroup } from "../domain/foodGroup";
import { HouseholdItem } from "../domain/household";
import { Food } from "../domain/ingredient";
import { Category, OutdoorEntry, RecipeDetails } from "../domain/recipe";
import { db } from "./databaseService";

export interface CachedCatalogue {
  recipes: Record<string, RecipeDetails>;
  foods: Record<string, Food>;
  outdoor: Record<string, OutdoorEntry>;
  householdItems: Record<string, HouseholdItem>;
  categories: Category[];
  foodGroups: FoodGroup[];
}

async function replaceTable<T>(table: Table<T>, rows: T[]): Promise<void> {
  await db.transaction("rw", table, async () => {
    await table.clear();
    await table.bulkPut(rows);
  });
}

export async function readCatalogueCache(): Promise<CachedCatalogue> {
  const [recipes, foods, outdoor, householdItems, categories, foodGroups] = await Promise.all([
    db.recipes.toArray(),
    db.foods.toArray(),
    db.outdoorActivities.toArray(),
    db.householdItems.toArray(),
    db.recipeCategories.toArray(),
    db.foodGroups.toArray(),
  ]);
  return {
    recipes: Object.fromEntries(recipes.map((row) => [row.id, row])),
    foods: Object.fromEntries(foods.map((row) => [row.id, row])),
    outdoor: Object.fromEntries(outdoor.map((row) => [row.code, row])),
    householdItems: Object.fromEntries(householdItems.map((row) => [row.id, row])),
    categories,
    foodGroups,
  };
}

export async function writeCatalogueCache(catalogue: CachedCatalogue): Promise<void> {
  await Promise.all([
    replaceTable(db.recipes, Object.entries(catalogue.recipes).map(([code, recipe]) => ({ ...recipe, id: code }))),
    replaceTable(db.foods, Object.entries(catalogue.foods).map(([id, food]) => ({ ...food, id }))),
    replaceTable(db.outdoorActivities, Object.entries(catalogue.outdoor).map(([code, entry]) => ({ ...entry, id: code }))),
    replaceTable(db.householdItems, Object.values(catalogue.householdItems)),
    replaceTable(db.recipeCategories, catalogue.categories),
    replaceTable(db.foodGroups, catalogue.foodGroups),
  ]);
}

export async function putCachedRecipe(code: string, recipe: RecipeDetails): Promise<void> {
  await db.recipes.put({ ...recipe, id: code });
}

export async function removeCachedRecipe(code: string): Promise<void> {
  await db.recipes.delete(code);
}
