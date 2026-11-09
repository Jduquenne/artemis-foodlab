import { RecipeKind } from "../../domain/recipe";

export const DEFAULT_PORTIONS_PER_PERSON = 1;
export const MAX_PORTIONS_PER_PERSON = 100;

export function portionsPerPersonOf(recipe: { portionsPerPerson?: number } | undefined): number {
  return recipe?.portionsPerPerson ?? DEFAULT_PORTIONS_PER_PERSON;
}

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-9;
}

export function validatePortionsPerPerson(value: number | null | undefined, kind: RecipeKind): string[] {
  if (kind !== RecipeKind.DISH || value === undefined) return [];
  if (value === null || value <= 0) return ["Les portions par personne doivent être strictement positives."];
  if (value > MAX_PORTIONS_PER_PERSON) return [`Les portions par personne ne doivent pas dépasser ${MAX_PORTIONS_PER_PERSON}.`];
  if (!hasAtMostTwoDecimals(value)) return ["Les portions par personne ne peuvent avoir que 2 décimales au maximum."];
  return [];
}

export function portionsPerPersonToApi(value: number | null | undefined, kind: RecipeKind): number {
  if (kind !== RecipeKind.DISH || value === null || value === undefined) return DEFAULT_PORTIONS_PER_PERSON;
  return value;
}
