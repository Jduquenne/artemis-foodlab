import { Category } from "../domain/categories";
import { db } from "./databaseService";

export const getAll = () => db.recipeCategories.toArray();

export const bulkPut = async (categories: Category[]) => {
  await db.transaction("rw", db.recipeCategories, async () => {
    await db.recipeCategories.clear();
    await db.recipeCategories.bulkPut(categories);
  });
};
