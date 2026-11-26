import { SlotType } from "./planning";

export interface MealTimeRange {
  start: string;
  end: string;
}

export type MealTimes = Record<SlotType, MealTimeRange>;

export const DEFAULT_MEAL_TIMES: MealTimes = {
  breakfast: { start: "07:00", end: "10:00" },
  lunch: { start: "12:00", end: "14:00" },
  snack: { start: "16:00", end: "17:00" },
  dinner: { start: "19:00", end: "22:00" },
};
