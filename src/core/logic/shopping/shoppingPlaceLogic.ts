import { ConsolidatedIngredient } from "../../domain/shopping";

export type PlaceFilter = "all" | "place" | "elsewhere";

export const PLACE_BATCH_MAX = 200;

export function filterIngredientsByPlace(
  ingredients: readonly ConsolidatedIngredient[],
  atPlace: ReadonlySet<string>,
  filter: PlaceFilter,
): ConsolidatedIngredient[] {
  if (filter === "all") return [...ingredients];
  return ingredients.filter((ingredient) => atPlace.has(ingredient.key) === (filter === "place"));
}

export function placeFoodIds(keys: readonly string[], keyToFoodId: ReadonlyMap<string, string>): string[] {
  const foodIds = keys.flatMap((key) => {
    const foodId = keyToFoodId.get(key);
    return foodId ? [foodId] : [];
  });
  return [...new Set(foodIds)];
}

export function allKeysAtPlace(keys: readonly string[], atPlace: ReadonlySet<string>): boolean {
  return keys.length > 0 && keys.every((key) => atPlace.has(key));
}

export function chunkList<T>(list: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < list.length; index += size) chunks.push(list.slice(index, index + size));
  return chunks;
}

export function placeFilterTitle(filter: PlaceFilter, placeName: string | null): string | null {
  if (!placeName || filter === "all") return null;
  return filter === "place" ? `À acheter à ${placeName}` : `Hors ${placeName}`;
}
