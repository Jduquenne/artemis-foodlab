import { Category } from "../../domain/recipe";
import { isRecipeCategory } from "../../domain/recipePredicates";
import { RecapEntry } from "../dashboard/recapLogic";
import { categoryLabel } from "../recipe/categoryLogic";
import { buildRecipeDbId, suggestNextRecipeNumber } from "./recipeCodeLogic";

export const CATEGORY_UNLOCK_CLICKS = 5;
export const CATEGORY_UNLOCK_WINDOW_MS = 3000;

const DEMO_RECIPE_CODES: readonly string[] = ["char-041", "char-047", "pv-017"];

export interface CategoryChangeTarget {
  categoryId: string;
  recipeNumber: string;
  code: string;
}

export function registerUnlockClick(clicks: readonly number[], now: number): number[] {
  return [...clicks.filter((t) => now - t < CATEGORY_UNLOCK_WINDOW_MS), now];
}

export function isCategoryUnlocked(clicks: readonly number[]): boolean {
  return clicks.length >= CATEGORY_UNLOCK_CLICKS;
}

export function categoryChangeOptions(categories: readonly Category[], currentCategoryId: string): Category[] {
  return categories.filter((c) => isRecipeCategory(c) && c.id !== currentCategoryId);
}

export function planCategoryChange(existingCodes: readonly string[], categoryId: string): CategoryChangeTarget {
  const recipeNumber = suggestNextRecipeNumber(existingCodes, categoryId);
  return { categoryId, recipeNumber, code: buildRecipeDbId(categoryId, recipeNumber) };
}

export function isDemoRecipeCode(code: string): boolean {
  return DEMO_RECIPE_CODES.includes(code);
}

export function buildCategoryChangeRecap(
  categories: Category[],
  sourceCode: string,
  currentCategoryId: string,
  target: CategoryChangeTarget | null,
): RecapEntry[] {
  const current = categoryLabel(categories, currentCategoryId);
  if (!target) {
    return [
      { label: "Catégorie", value: current },
      { label: "Identifiant", value: sourceCode },
    ];
  }
  return [
    { label: "Catégorie", from: current, to: categoryLabel(categories, target.categoryId) },
    { label: "Identifiant", from: sourceCode, to: target.code },
  ];
}
