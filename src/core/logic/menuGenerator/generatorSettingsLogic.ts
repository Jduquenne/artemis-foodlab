import { addDays, parseISO } from "date-fns";
import {
  DietFilter,
  GENERATED_SLOTS,
  GeneratedSlotType,
  MAX_GENERATION_DAYS,
  MenuGeneratorSettings,
  PeriodDay,
  PreferredFood,
  PreferredFoodMode,
  SavedGeneratorSettings,
  SeasonMode,
} from "../../domain/menuGenerator";
import { MealSlot } from "../../domain/planning";
import { toIsoDate, isoDateFromWeekDay } from "../../utils/dateUtils";
import { mealKey } from "./menuEngineLogic";
import { periodLength, validatePeriod } from "./periodLogic";

export const DIET_OPTIONS: { id: DietFilter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "pescatarian", label: "Pescétarien" },
  { id: "vegetarian", label: "Végétarien" },
];

export const SEASON_OPTIONS: { id: SeasonMode; label: string }[] = [
  { id: "preferred", label: "De préférence" },
  { id: "strict", label: "Uniquement" },
  { id: "off", label: "Ignorer" },
];

export const GENERATED_SLOT_LABELS: Record<GeneratedSlotType, string> = {
  lunch: "Déjeuner",
  dinner: "Dîner",
};

const DEFAULT_PERIOD_DAYS = 7;

function endDateFor(startDate: string, periodDays: number): string {
  return toIsoDate(addDays(parseISO(startDate), periodDays - 1));
}

export function defaultGeneratorSettings(startDate: string): MenuGeneratorSettings {
  return {
    startDate,
    endDate: endDateFor(startDate, DEFAULT_PERIOD_DAYS),
    slots: [...GENERATED_SLOTS],
    diet: "all",
    excludedFoodIds: [],
    preferredFoods: [],
    season: "preferred",
    useFreezer: true,
  };
}

export function validateGeneratorSettings(settings: MenuGeneratorSettings): string | null {
  return validatePeriod(settings.startDate, settings.endDate)
    ?? (settings.slots.length === 0 ? "Choisis au moins un repas à générer." : null);
}

export function toggleGeneratedSlot(slots: readonly GeneratedSlotType[], slot: GeneratedSlotType): GeneratedSlotType[] {
  const next = slots.includes(slot) ? slots.filter((s) => s !== slot) : [...slots, slot];
  return GENERATED_SLOTS.filter((s) => next.includes(s));
}

export const PREFERRED_FOOD_MODE_OPTIONS: { id: PreferredFoodMode; label: string }[] = [
  { id: "bonus", label: "Bonus" },
  { id: "atLeastOnce", label: "Au moins 1×" },
];

export function toggleExcludedFood(
  settings: Pick<MenuGeneratorSettings, "excludedFoodIds" | "preferredFoods">,
  foodId: string,
): Pick<MenuGeneratorSettings, "excludedFoodIds" | "preferredFoods"> {
  const excluded = settings.excludedFoodIds.includes(foodId);
  return {
    excludedFoodIds: excluded ? settings.excludedFoodIds.filter((id) => id !== foodId) : [...settings.excludedFoodIds, foodId],
    preferredFoods: settings.preferredFoods.filter((item) => item.foodId !== foodId),
  };
}

export function togglePreferredFood(
  settings: Pick<MenuGeneratorSettings, "excludedFoodIds" | "preferredFoods">,
  foodId: string,
): Pick<MenuGeneratorSettings, "excludedFoodIds" | "preferredFoods"> {
  const preferred = settings.preferredFoods.some((item) => item.foodId === foodId);
  return {
    excludedFoodIds: settings.excludedFoodIds.filter((id) => id !== foodId),
    preferredFoods: preferred
      ? settings.preferredFoods.filter((item) => item.foodId !== foodId)
      : [...settings.preferredFoods, { foodId, mode: "bonus" }],
  };
}

export function setPreferredFoodMode(foods: readonly PreferredFood[], foodId: string, mode: PreferredFoodMode): PreferredFood[] {
  return foods.map((item) => (item.foodId === foodId ? { ...item, mode } : item));
}

function restorePreferredFoods(value: unknown): PreferredFood[] {
  if (!Array.isArray(value)) return [];
  const result: PreferredFood[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || !("foodId" in item) || typeof item.foodId !== "string") continue;
    if (result.some((existing) => existing.foodId === item.foodId)) continue;
    const mode = "mode" in item && item.mode === "atLeastOnce" ? "atLeastOnce" : "bonus";
    result.push({ foodId: item.foodId, mode });
  }
  return result;
}

export function existingMealsByKey(slots: readonly MealSlot[], days: readonly PeriodDay[]): Record<string, string[]> {
  const dates = new Set(days.map((day) => day.date));
  const result: Record<string, string[]> = {};
  for (const slot of slots) {
    if ((slot.slot !== "lunch" && slot.slot !== "dinner") || slot.recipeIds.length === 0) continue;
    const date = isoDateFromWeekDay(slot.year, slot.week, slot.day);
    if (dates.has(date)) result[mealKey(date, slot.slot as GeneratedSlotType)] = [...slot.recipeIds];
  }
  return result;
}

function settingsSignature(settings: MenuGeneratorSettings): string {
  return JSON.stringify({
    ...settings,
    excludedFoodIds: [...settings.excludedFoodIds].sort(),
    preferredFoods: [...settings.preferredFoods].sort((a, b) => a.foodId.localeCompare(b.foodId)),
  });
}

export function sameGeneratorSettings(a: MenuGeneratorSettings, b: MenuGeneratorSettings): boolean {
  return settingsSignature(a) === settingsSignature(b);
}

export function toSavedSettings(settings: MenuGeneratorSettings): SavedGeneratorSettings {
  const { startDate, endDate, ...rest } = settings;
  return { ...rest, periodDays: periodLength(startDate, endDate) ?? DEFAULT_PERIOD_DAYS };
}

function oneOf<T extends string>(value: unknown, options: readonly { id: T }[], fallback: T): T {
  return options.find((option) => option.id === value)?.id ?? fallback;
}

export function restoreGeneratorSettings(saved: Partial<SavedGeneratorSettings> | null, startDate: string): MenuGeneratorSettings {
  const defaults = defaultGeneratorSettings(startDate);
  if (!saved) return defaults;
  const periodDays = typeof saved.periodDays === "number" && Number.isInteger(saved.periodDays)
    ? Math.min(MAX_GENERATION_DAYS, Math.max(1, saved.periodDays))
    : DEFAULT_PERIOD_DAYS;
  const slots = Array.isArray(saved.slots) ? GENERATED_SLOTS.filter((slot) => saved.slots?.includes(slot)) : defaults.slots;
  return {
    ...defaults,
    endDate: endDateFor(startDate, periodDays),
    slots: slots.length > 0 ? slots : defaults.slots,
    diet: oneOf(saved.diet, DIET_OPTIONS, defaults.diet),
    season: oneOf(saved.season, SEASON_OPTIONS, defaults.season),
    excludedFoodIds: Array.isArray(saved.excludedFoodIds) ? saved.excludedFoodIds.filter((id) => typeof id === "string") : [],
    preferredFoods: restorePreferredFoods(saved.preferredFoods),
    useFreezer: typeof saved.useFreezer === "boolean" ? saved.useFreezer : defaults.useFreezer,
  };
}
