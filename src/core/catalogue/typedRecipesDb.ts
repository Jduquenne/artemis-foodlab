import { RecipeDetails } from "../domain/recipe";
import { replaceRecordInPlace } from "./replaceInPlace";

export const typedRecipesDb: Record<string, RecipeDetails> = {};

export function replaceRecipesDb(next: Record<string, RecipeDetails>): void {
  replaceRecordInPlace(typedRecipesDb, next);
}

export function putRecipeInDb(code: string, recipe: RecipeDetails): void {
  typedRecipesDb[code] = recipe;
}

export function removeRecipeFromDb(code: string): void {
  delete typedRecipesDb[code];
}
