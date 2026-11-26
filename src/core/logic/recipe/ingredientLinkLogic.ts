import { Ingredient } from "../../domain/ingredient";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function idOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

export function linkCachedIngredient(value: unknown): unknown {
  if (!isRecord(value) || typeof value.link === "string") return value;
  const { foodId, baseId, foodGroupId, ...rest } = value;
  const base = idOrNull(baseId);
  if (base !== null) return { ...rest, link: "base", baseId: base };
  const food = idOrNull(foodId);
  if (food !== null) return { ...rest, link: "food", foodId: food, foodGroupId: idOrNull(foodGroupId), removed: false };
  return { ...rest, link: "free" };
}

export function linkCachedIngredients(value: unknown): unknown {
  return Array.isArray(value) ? value.map(linkCachedIngredient) : value;
}

function withRemovedFlag(value: unknown): unknown {
  if (!isRecord(value) || value.link !== "food" || typeof value.removed === "boolean") return value;
  return { ...value, removed: false };
}

export function flagCachedIngredients(value: unknown): unknown {
  return Array.isArray(value) ? value.map(withRemovedFlag) : value;
}

export function ingredientFoodId(ingredient: Ingredient): string | null {
  return ingredient.link === "food" ? ingredient.foodId : null;
}
