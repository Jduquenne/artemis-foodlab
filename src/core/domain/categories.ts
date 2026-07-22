export interface Category {
  id: string;
  name: string;
  color: string;
}

export const CATEGORIES: Category[] = [];

export function replaceCategories(next: Category[]): void {
  CATEGORIES.length = 0;
  CATEGORIES.push(...next);
}

export const getCategoryById = (id: string) =>
  CATEGORIES.find((c) => c.id === id);
