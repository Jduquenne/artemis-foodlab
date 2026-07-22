import { apiFetchJson } from "./apiClient";
import { MacroTargets } from "../domain/types";

interface ApiJournalSettings {
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

interface ApiJournalOverride {
  planningSlotItemId: string;
  portionsOverride: number | null;
  gramsOverride: number | null;
}

export interface JournalOverrides {
  portionOverrides: Record<string, number>;
  gramOverrides: Record<string, number>;
}

export async function syncJournalSettingsFromApi(): Promise<JournalSettings> {
  const api = await apiFetchJson<ApiJournalSettings>("/journal-settings");
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

export async function syncJournalOverridesFromApi(): Promise<JournalOverrides> {
  const portionOverrides: Record<string, number> = {};
  const gramOverrides: Record<string, number> = {};
  const overrides = await apiFetchJson<ApiJournalOverride[]>("/journal-overrides");
  for (const o of overrides) {
    if (o.portionsOverride != null) portionOverrides[o.planningSlotItemId] = o.portionsOverride;
    if (o.gramsOverride != null) gramOverrides[o.planningSlotItemId] = o.gramsOverride;
  }
  return { portionOverrides, gramOverrides };
}

export async function savePortionOverride(planningSlotItemId: string, portions: number): Promise<void> {
  await apiFetchJson("/journal-overrides", {
    method: "POST",
    body: { planningSlotItemId, portionsOverride: portions },
  });
}

export async function saveGramOverride(planningSlotItemId: string, grams: number): Promise<void> {
  await apiFetchJson("/journal-overrides", {
    method: "POST",
    body: { planningSlotItemId, gramsOverride: grams },
  });
}
