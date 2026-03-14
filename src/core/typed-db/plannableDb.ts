import { typedRecipesDb } from "./typedRecipesDb";
import outdoorDb from "../data/outdoor-db.json";
import { RecipeDetails } from "../domain/types";

export const plannableDb = {
  ...typedRecipesDb,
  ...(outdoorDb as unknown as Record<string, RecipeDetails>),
};
