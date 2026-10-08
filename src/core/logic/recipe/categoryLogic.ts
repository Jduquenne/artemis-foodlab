import { Category } from "../../domain/recipe";

export function categoryLabel(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}
