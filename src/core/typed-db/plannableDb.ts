import { PlannableItem } from "../domain/recipe";
import { typedOutdoorDb } from "./typedOutdoorDb";
import { typedRecipesDb } from "./typedRecipesDb";

export function buildPlannableDb(): Record<string, PlannableItem> {
  return { ...typedRecipesDb, ...typedOutdoorDb };
}
