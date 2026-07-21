import recipesDbRaw from "../data/recipes-db.json";
import { RecipeDetails } from "../domain/types";

export const rawRecipesDb = recipesDbRaw as unknown as Record<string, RecipeDetails>;

export const typedRecipesDb: Record<string, RecipeDetails> = { ...rawRecipesDb };

export function replaceRecipesDb(next: Record<string, RecipeDetails>): void {
  for (const key of Object.keys(typedRecipesDb)) delete typedRecipesDb[key];
  Object.assign(typedRecipesDb, next);
}
