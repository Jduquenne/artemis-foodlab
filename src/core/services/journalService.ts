import { apiFetchJson } from "./apiClient";

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

export async function saveJournalOverride(
  planningSlotItemId: string,
  profileId: string,
  input: JournalOverrideInput,
): Promise<ApiJournalOverride> {
  return apiFetchJson<ApiJournalOverride>("/journal-overrides", {
    method: "POST",
    body: {
      planningSlotItemId,
      profileId,
      portionsOverride: input.portionsOverride,
      gramsOverride: input.gramsOverride,
      ingredientOverrides: Object.entries(input.ingredientOverrides).map(([recipeIngredientId, gramsOverride]) => ({
        recipeIngredientId,
        gramsOverride,
      })),
    },
  });
}
