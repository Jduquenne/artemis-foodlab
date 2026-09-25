import { Category } from "../domain/recipe";
import { replaceArrayInPlace } from "./replaceInPlace";

export const categoriesCatalogue: Category[] = [];

export function replaceCategories(next: Category[]): void {
  replaceArrayInPlace(categoriesCatalogue, next);
}

export const getCategoryById = (id: string) =>
  categoriesCatalogue.find((c) => c.id === id);
