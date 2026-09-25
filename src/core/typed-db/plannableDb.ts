import { typedRecipesDb } from "./typedRecipesDb";
import { typedOutdoorDb } from "./typedOutdoorDb";
import { RecipeDetails } from "../domain/recipe";

const outdoor = typedOutdoorDb as unknown as Record<string, RecipeDetails>;

export function buildPlannableDb(): Record<string, RecipeDetails> {
  return { ...typedRecipesDb, ...outdoor };
}

export const plannableDb: Record<string, RecipeDetails> = buildPlannableDb();

export function refreshPlannableDb(): void {
  for (const key of Object.keys(plannableDb)) delete plannableDb[key];
  Object.assign(plannableDb, buildPlannableDb());
}
