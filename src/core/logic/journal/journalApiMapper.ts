import { JournalOverridesByProfile } from "../../domain/journal";

export interface ApiIngredientOverride {
  recipeIngredientId: string;
  gramsOverride: number;
}

export interface ApiJournalOverride {
  id: string;
  profileId: string;
  planningSlotItemId: string;
  portionsOverride: number | null;
  gramsOverride: number | null;
  ingredientOverrides: ApiIngredientOverride[];
}

export function mapJournalOverrides(overrides: ApiJournalOverride[]): JournalOverridesByProfile {
  const byProfile: JournalOverridesByProfile = {};
  for (const o of overrides) {
    const target = (byProfile[o.profileId] ??= { portionOverrides: {}, gramOverrides: {}, ingredientOverrides: {} });
    if (o.portionsOverride != null) target.portionOverrides[o.planningSlotItemId] = o.portionsOverride;
    if (o.gramsOverride != null) target.gramOverrides[o.planningSlotItemId] = o.gramsOverride;
    if (o.ingredientOverrides.length > 0) {
      target.ingredientOverrides[o.planningSlotItemId] = Object.fromEntries(
        o.ingredientOverrides.map((i) => [i.recipeIngredientId, i.gramsOverride]),
      );
    }
  }
  return byProfile;
}
