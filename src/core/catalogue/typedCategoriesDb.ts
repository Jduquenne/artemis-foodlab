import { Category } from "../domain/recipe";
import { replaceArrayInPlace } from "./replaceInPlace";

export const typedCategoriesDb: Category[] = [];

export function replaceCategoriesDb(next: Category[]): void {
  replaceArrayInPlace(typedCategoriesDb, next);
}

export const getCategoryById = (id: string) =>
  typedCategoriesDb.find((c) => c.id === id);
