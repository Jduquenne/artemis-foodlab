import { Food } from "../domain/ingredient";
import { replaceRecordInPlace } from "./replaceInPlace";

export const foodsCatalogue: Record<string, Food> = {};

export function replaceFoods(next: Record<string, Food>): void {
  replaceRecordInPlace(foodsCatalogue, next);
}
