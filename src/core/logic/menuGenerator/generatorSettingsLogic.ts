import { addDays, parseISO } from "date-fns";
import {
  DietFilter,
  GENERATED_SLOTS,
  GeneratedSlotType,
  HabitProtein,
  HabitRule,
  HabitStrength,
  HabitTarget,
  MAX_GENERATION_DAYS,
  QuotaComparator,
  QuotaStrictness,
  QuotaTarget,
  WeeklyQuota,
  MenuGeneratorSettings,
  PeriodDay,
  PreferredFood,
  PreferredFoodMode,
  SavedGeneratorSettings,
  SeasonMode,
} from "../../domain/menuGenerator";
import { MealSlot } from "../../domain/planning";
import { DAYS } from "../../domain/planningConfig";
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
    habits: [],
    quotas: [],
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

const HABIT_PROTEINS: readonly HabitProtein[] = ["fish", "meat", "redMeat", "whiteMeat", "deli", "vegetarian"];

const HABIT_STRENGTHS: readonly HabitStrength[] = ["mandatory", "preferred", "avoid", "forbidden"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function restoreHabitTarget(value: unknown): HabitTarget | null {
  if (!isRecord(value)) return null;
  switch (value.kind) {
    case "protein": {
      const protein = HABIT_PROTEINS.find((item) => item === value.protein);
      return protein ? { kind: "protein", protein } : null;
    }
    case "category":
      return typeof value.categoryId === "string" ? { kind: "category", categoryId: value.categoryId } : null;
    case "food":
      return typeof value.foodId === "string" ? { kind: "food", foodId: value.foodId } : null;
    case "recipe":
      return typeof value.recipeCode === "string" ? { kind: "recipe", recipeCode: value.recipeCode } : null;
    case "noMeal":
      return { kind: "noMeal" };
    default:
      return null;
  }
}

function restoreHabit(value: unknown): HabitRule | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const target = restoreHabitTarget(value.target);
  const strength = HABIT_STRENGTHS.find((item) => item === value.strength);
  const rawDays = Array.isArray(value.days) ? value.days : [];
  const rawSlots = Array.isArray(value.slots) ? value.slots : [];
  const days = DAYS.filter((day) => rawDays.includes(day));
  const slots = GENERATED_SLOTS.filter((slot) => rawSlots.includes(slot));
  if (!target || !strength || days.length === 0 || slots.length === 0) return null;
  return { id: value.id, enabled: value.enabled !== false, days, slots, target, strength };
}

const QUOTA_COMPARATORS: readonly QuotaComparator[] = ["atLeast", "atMost"];

const QUOTA_STRICTNESSES: readonly QuotaStrictness[] = ["strict", "preferred"];

export const MAX_QUOTA_COUNT = 14;

function restoreQuota(value: unknown): WeeklyQuota | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const target = restoreHabitTarget(value.target);
  const comparator = QUOTA_COMPARATORS.find((item) => item === value.comparator);
  const strictness = QUOTA_STRICTNESSES.find((item) => item === value.strictness);
  const count = typeof value.count === "number" && Number.isInteger(value.count) ? Math.min(MAX_QUOTA_COUNT, Math.max(0, value.count)) : null;
  if (!target || target.kind === "noMeal" || !comparator || !strictness || count === null) return null;
  const quotaTarget: QuotaTarget = target;
  return { id: value.id, enabled: value.enabled !== false, target: quotaTarget, comparator, count, strictness };
}

function restoreQuotas(value: unknown): WeeklyQuota[] {
  if (!Array.isArray(value)) return [];
  return value.map(restoreQuota).filter((quota): quota is WeeklyQuota => quota !== null);
}

function restoreHabits(value: unknown): HabitRule[] {
  if (!Array.isArray(value)) return [];
  return value.map(restoreHabit).filter((rule): rule is HabitRule => rule !== null);
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
    habits: restoreHabits(saved.habits),
    quotas: restoreQuotas(saved.quotas),
  };
}
