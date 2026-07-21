import { typedRecipesDb } from "./typedRecipesDb";
import outdoorDb from "../data/outdoor-db.json";
import { RecipeDetails } from "../domain/types";

const outdoor = outdoorDb as unknown as Record<string, RecipeDetails>;

export const plannableDb: Record<string, RecipeDetails> = { ...typedRecipesDb, ...outdoor };

export function refreshPlannableDb(): void {
  for (const key of Object.keys(plannableDb)) delete plannableDb[key];
  Object.assign(plannableDb, typedRecipesDb, outdoor);
}
