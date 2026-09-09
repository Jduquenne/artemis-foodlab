import { Food } from "../domain/types";

export const typedFoodDb: Record<string, Food> = {};

export function replaceFoodDb(next: Record<string, Food>): void {
  for (const key of Object.keys(typedFoodDb)) delete typedFoodDb[key];
  Object.assign(typedFoodDb, next);
}
