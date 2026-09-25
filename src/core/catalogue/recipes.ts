import { RecipeDetails } from "../domain/recipe";
import { replaceRecordInPlace } from "./replaceInPlace";

export const recipesCatalogue: Record<string, RecipeDetails> = {};

export function replaceRecipes(next: Record<string, RecipeDetails>): void {
  replaceRecordInPlace(recipesCatalogue, next);
}

export function putRecipe(code: string, recipe: RecipeDetails): void {
  recipesCatalogue[code] = recipe;
}

export function removeRecipe(code: string): void {
  delete recipesCatalogue[code];
}
