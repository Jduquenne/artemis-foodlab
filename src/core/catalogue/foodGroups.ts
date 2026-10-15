import { FoodGroup } from "../domain/foodGroup";
import { replaceArrayInPlace } from "./replaceInPlace";

export const foodGroupsCatalogue: FoodGroup[] = [];

export function replaceFoodGroups(next: FoodGroup[]): void {
  replaceArrayInPlace(foodGroupsCatalogue, next);
}
