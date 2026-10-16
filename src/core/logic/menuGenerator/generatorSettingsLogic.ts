import { addDays, parseISO } from "date-fns";
import { DietFilter, GENERATED_SLOTS, GeneratedSlotType, MenuGeneratorSettings, PeriodDay, SeasonMode } from "../../domain/menuGenerator";
import { MealSlot } from "../../domain/planning";
import { toIsoDate, isoDateFromWeekDay } from "../../utils/dateUtils";
import { mealKey } from "./menuEngineLogic";
import { validatePeriod } from "./periodLogic";

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

export function defaultGeneratorSettings(startDate: string): MenuGeneratorSettings {
  return {
    startDate,
    endDate: toIsoDate(addDays(parseISO(startDate), 6)),
    slots: [...GENERATED_SLOTS],
    diet: "all",
    excludedFoodIds: [],
    season: "preferred",
    freezerFirst: true,
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

export function toggleExcludedFood(ids: readonly string[], foodId: string): string[] {
  return ids.includes(foodId) ? ids.filter((id) => id !== foodId) : [...ids, foodId];
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
