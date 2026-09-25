import { RecipeBuilderState } from "../../domain/recipeBuilderTypes";
import { padNumber } from "../../../shared/utils/numberUtils";

export const CATEGORY_PREFIX: Record<string, string> = {
  bases: "BASE",
  "cereal-products": "PC",
  "dairy-products": "PL",
  "dry-food": "AS",
  charcuterie: "CHAR",
  fish: "POI",
  fruits: "FR",
  pastries: "PAT",
  "plant-proteins": "PV",
  "red-meat": "VR",
  veggies: "VEG",
  "white-meat": "VB",
  "sweet-grocery": "ES",
  outdoor: "OD",
};

export function buildRecipeId(
  categoryId: string,
  recipeNumber: string,
): string {
  const prefix = CATEGORY_PREFIX[categoryId] ?? categoryId.toUpperCase();
  if (!recipeNumber) return prefix;
  const num = parseInt(recipeNumber, 10);
  return `${prefix}_${isNaN(num) ? recipeNumber : padNumber(num, 2)}`;
}

export function buildRecipeDbId(
  categoryId: string,
  recipeNumber: string,
): string {
  const prefix = (CATEGORY_PREFIX[categoryId] ?? categoryId).toLowerCase();
  if (!recipeNumber) return prefix;
  const num = parseInt(recipeNumber, 10);
  return `${prefix}-${isNaN(num) ? recipeNumber : padNumber(num, 3)}`;
}

export function buildImageName(
  categoryId: string,
  recipeNumber: string,
  recipeName: string,
  type?: string,
): string {
  const id = buildRecipeId(categoryId, recipeNumber);
  const namePart = recipeName.trim().replace(/ /g, "_");
  return type ? `${id}_${namePart}_${type}` : `${id}_${namePart}`;
}

export function getBuilderRecipeCode(state: RecipeBuilderState): string {
  return buildRecipeDbId(state.categoryId, state.recipeNumber);
}

export function suggestNextRecipeNumber(existingCodes: readonly string[], categoryId: string): string {
  const prefix = (CATEGORY_PREFIX[categoryId] ?? categoryId).toLowerCase();
  const pattern = new RegExp(`^${prefix}-0*(\\d+)$`);
  let max = 0;
  for (const code of existingCodes) {
    const match = pattern.exec(code);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return String(max + 1);
}
