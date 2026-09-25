import { Category } from "../domain/types";

export const typedCategoriesDb: Category[] = [];

export function replaceCategoriesDb(next: Category[]): void {
  typedCategoriesDb.length = 0;
  typedCategoriesDb.push(...next);
}

export const getCategoryById = (id: string) =>
  typedCategoriesDb.find((c) => c.id === id);
