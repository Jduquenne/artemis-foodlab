import { apiFetchJson } from "./apiClient";
import { MacroTargets } from "../domain/types";

export interface ApiJournalSettings {
  kcalTarget: number;
  proteinsTarget: number;
  lipidsTarget: number;
  carbohydratesTarget: number;
  fibersTarget: number;
}

export interface JournalSettings {
  kcalTarget: number;
  macroTargets: MacroTargets;
}

export interface ApiIngredientOverride {
  recipeIngredientId: string;
  gramsOverride: number;
}

export interface ApiJournalOverride {
  id: string;
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

export interface JournalOverrideInput {
  portionsOverride: number | null;
  gramsOverride: number | null;
  ingredientOverrides: Record<string, number>;
}

export function mapJournalSettings(api: ApiJournalSettings): JournalSettings {
  return {
    kcalTarget: api.kcalTarget,
    macroTargets: {
      proteins: api.proteinsTarget,
      lipids: api.lipidsTarget,
      carbohydrates: api.carbohydratesTarget,
      fibers: api.fibersTarget,
    },
  };
}

export function mapJournalOverrides(overrides: ApiJournalOverride[]): JournalOverrides {
  const portionOverrides: Record<string, number> = {};
  const gramOverrides: Record<string, number> = {};
  const ingredientOverrides: Record<string, Record<string, number>> = {};
  for (const o of overrides) {
    if (o.portionsOverride != null) portionOverrides[o.planningSlotItemId] = o.portionsOverride;
    if (o.gramsOverride != null) gramOverrides[o.planningSlotItemId] = o.gramsOverride;
    if (o.ingredientOverrides.length > 0) {
      ingredientOverrides[o.planningSlotItemId] = Object.fromEntries(
        o.ingredientOverrides.map((i) => [i.recipeIngredientId, i.gramsOverride]),
      );
    }
  }
  return { portionOverrides, gramOverrides, ingredientOverrides };
}

export async function saveJournalSettings(settings: JournalSettings): Promise<void> {
  await apiFetchJson("/journal-settings", {
    method: "PUT",
    body: {
      kcalTarget: settings.kcalTarget,
      proteinsTarget: settings.macroTargets.proteins,
      lipidsTarget: settings.macroTargets.lipids,
      carbohydratesTarget: settings.macroTargets.carbohydrates,
      fibersTarget: settings.macroTargets.fibers,
    },
  });
}

export async function saveJournalOverride(
  planningSlotItemId: string,
  input: JournalOverrideInput,
): Promise<ApiJournalOverride> {
  return apiFetchJson<ApiJournalOverride>("/journal-overrides", {
    method: "POST",
    body: {
      planningSlotItemId,
      portionsOverride: input.portionsOverride,
      gramsOverride: input.gramsOverride,
      ingredientOverrides: Object.entries(input.ingredientOverrides).map(([recipeIngredientId, gramsOverride]) => ({
        recipeIngredientId,
        gramsOverride,
      })),
    },
  });
}
