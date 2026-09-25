import { typedRecipesDb } from "./typedRecipesDb";
import { typedOutdoorDb } from "./typedOutdoorDb";
import { RecipeDetails } from "../domain/recipe";
import { replaceRecordInPlace } from "./replaceInPlace";

const outdoor = typedOutdoorDb as unknown as Record<string, RecipeDetails>;

export function buildPlannableDb(): Record<string, RecipeDetails> {
  return { ...typedRecipesDb, ...outdoor };
}

export const plannableDb: Record<string, RecipeDetails> = buildPlannableDb();

export function refreshPlannableDb(): void {
  replaceRecordInPlace(plannableDb, buildPlannableDb());
}
