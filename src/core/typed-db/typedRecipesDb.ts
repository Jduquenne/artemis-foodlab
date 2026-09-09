import { RecipeDetails } from "../domain/types";

export const typedRecipesDb: Record<string, RecipeDetails> = {};

export function replaceRecipesDb(next: Record<string, RecipeDetails>): void {
  for (const key of Object.keys(typedRecipesDb)) delete typedRecipesDb[key];
  Object.assign(typedRecipesDb, next);
}

export function putRecipeInDb(code: string, recipe: RecipeDetails): void {
  typedRecipesDb[code] = recipe;
}

export function removeRecipeFromDb(code: string): void {
  delete typedRecipesDb[code];
}
