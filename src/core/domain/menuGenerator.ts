import { MealType } from "./recipe";

export type GeneratedSlotType = MealType.LUNCH | MealType.DINNER;

export const GENERATED_SLOTS: readonly GeneratedSlotType[] = [MealType.LUNCH, MealType.DINNER];

export const MAX_GENERATION_DAYS = 14;

export type DietFilter = "all" | "pescatarian" | "vegetarian";

export type SeasonMode = "off" | "preferred" | "strict";

export interface MenuGeneratorSettings {
  startDate: string;
  endDate: string;
  slots: GeneratedSlotType[];
  diet: DietFilter;
  excludedFoodIds: string[];
  season: SeasonMode;
}

export interface PeriodDay {
  date: string;
  year: number;
  week: number;
  day: string;
  month: number;
}

export interface RecipeDietProfile {
  hasMeat: boolean;
  hasFish: boolean;
}

export const KCAL_SLOT_SHARE: Record<GeneratedSlotType, number> = {
  [MealType.LUNCH]: 0.35,
  [MealType.DINNER]: 0.3,
};

export const KCAL_TOLERANCE = 0.15;

export const RECENT_HISTORY_WEEKS = 3;

export interface GeneratedMeal {
  key: string;
  day: PeriodDay;
  slot: GeneratedSlotType;
  recipeCode: string | null;
  kept: boolean;
  locked: boolean;
  reasons: string[];
}
