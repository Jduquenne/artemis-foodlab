import { PlannableItem } from "../domain/recipe";
import { outdoorCatalogue } from "./outdoor";
import { recipesCatalogue } from "./recipes";

export function buildPlannableItems(): Record<string, PlannableItem> {
  const items: Record<string, PlannableItem> = {};
  for (const [code, recipe] of Object.entries(recipesCatalogue)) items[code] = { ...recipe, source: "recipe" };
  for (const [code, entry] of Object.entries(outdoorCatalogue)) items[code] = { ...entry, source: "outdoor" };
  return items;
}
