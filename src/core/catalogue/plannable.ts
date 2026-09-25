import { PlannableItem } from "../domain/recipe";
import { outdoorCatalogue } from "./outdoor";
import { recipesCatalogue } from "./recipes";

export function buildPlannableItems(): Record<string, PlannableItem> {
  return { ...recipesCatalogue, ...outdoorCatalogue };
}
