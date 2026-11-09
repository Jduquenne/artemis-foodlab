export const DEFAULT_PORTIONS_PER_PERSON = 1;

export function portionsPerPersonOf(recipe: { portionsPerPerson?: number } | undefined): number {
  return recipe?.portionsPerPerson ?? DEFAULT_PORTIONS_PER_PERSON;
}

export function defaultPersonsOf(recipe: { defaultPortions?: number; portionsPerPerson?: number } | undefined): number | undefined {
  if (!recipe || recipe.defaultPortions === undefined) return undefined;
  return Math.max(1, Math.round(recipe.defaultPortions / portionsPerPersonOf(recipe)));
}

export function plannedPortions(
  persons: number | undefined,
  recipe: { portionsPerPerson?: number } | undefined,
): number | undefined {
  if (persons === undefined) return undefined;
  return Math.max(1, Math.round(persons * portionsPerPersonOf(recipe)));
}
