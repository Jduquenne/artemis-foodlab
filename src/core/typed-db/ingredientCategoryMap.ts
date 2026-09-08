import { IngredientCategory } from "../domain/types";

export interface ApiIngredientCategory {
  id: string;
  name: string;
}

const idByName = new Map<string, string>();

export function setIngredientCategoryMap(entries: ApiIngredientCategory[]): void {
  idByName.clear();
  for (const { id, name } of entries) idByName.set(name, id);
}

export function getIngredientCategoryId(category: IngredientCategory): string | undefined {
  return idByName.get(category);
}

export function hasIngredientCategoryMap(): boolean {
  return idByName.size > 0;
}
