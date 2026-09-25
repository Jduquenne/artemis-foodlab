import { typedRecipesDb } from "./typedRecipesDb";
import { typedOutdoorDb } from "./typedOutdoorDb";
import { RecipeDetails } from "../domain/recipe";

const outdoor = typedOutdoorDb as unknown as Record<string, RecipeDetails>;

export const plannableDb: Record<string, RecipeDetails> = { ...typedRecipesDb, ...outdoor };

export function refreshPlannableDb(): void {
  for (const key of Object.keys(plannableDb)) delete plannableDb[key];
  Object.assign(plannableDb, typedRecipesDb, outdoor);
}
