import { Ingredient } from "./ingredient";

export function isRemovedIngredient(ingredient: Ingredient): boolean {
  return ingredient.link === "food" && ingredient.removed;
}
