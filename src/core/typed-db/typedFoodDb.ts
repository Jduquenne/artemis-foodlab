import foodDbRaw from "../data/food-db.json";
import { Food } from "../domain/types";

export const rawFoodDb = foodDbRaw as unknown as Record<string, Food>;

export const typedFoodDb: Record<string, Food> = { ...rawFoodDb };

export function replaceFoodDb(next: Record<string, Food>): void {
  for (const key of Object.keys(typedFoodDb)) delete typedFoodDb[key];
  Object.assign(typedFoodDb, next);
}
