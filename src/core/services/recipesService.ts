import { RecipeDetails } from "../domain/types";
import { db } from "./databaseService";

export const getAll = () => db.recipes.toArray();

export const getAllAsRecord = async (): Promise<Record<string, RecipeDetails>> => {
  const rows = await db.recipes.toArray();
  return Object.fromEntries(rows.map((row) => [row.id, row]));
};

export const bulkPut = async (records: Record<string, RecipeDetails>) => {
  const rows = Object.entries(records).map(([id, recipe]) => ({ ...recipe, id }));
  await db.transaction("rw", db.recipes, async () => {
    await db.recipes.clear();
    await db.recipes.bulkPut(rows);
  });
};

export const put = (id: string, recipe: RecipeDetails) => db.recipes.put({ ...recipe, id });

export const remove = (id: string) => db.recipes.delete(id);
