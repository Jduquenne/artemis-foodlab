import { Food } from "../domain/ingredient";
import { replaceRecordInPlace } from "./replaceInPlace";

export const typedFoodDb: Record<string, Food> = {};

export function replaceFoodDb(next: Record<string, Food>): void {
  replaceRecordInPlace(typedFoodDb, next);
}
