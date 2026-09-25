export interface JournalOverrides {
  portionOverrides: Record<string, number>;
  gramOverrides: Record<string, number>;
  ingredientOverrides: Record<string, Record<string, number>>;
}

export type JournalOverridesByProfile = Record<string, JournalOverrides>;

export interface JournalOverrideInput {
  portionsOverride: number | null;
  gramsOverride: number | null;
  ingredientOverrides: Record<string, number>;
}
