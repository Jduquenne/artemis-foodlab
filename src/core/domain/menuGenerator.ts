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
