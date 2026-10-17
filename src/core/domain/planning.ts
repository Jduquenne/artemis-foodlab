import { FoodChoice } from "./foodGroup";
import { MealType } from "./recipe";

export type SlotType = `${MealType}`;

export interface MealSlot {
  id: string;
  apiId?: string;
  itemApiIds?: Record<string, string>;
  day: string;
  slot: SlotType;
  recipeIds: string[];
  dessertIds?: string[];
  year: number;
  week: number;
  persons?: number;
  recipePersons?: Record<string, number>;
  recipeQuantities?: Record<string, number>;
  foodChoices?: Record<string, FoodChoice[]>;
}

export interface PlanningItemEntry {
  year: number;
  week: number;
  day: string;
  slot: SlotType;
  code: string;
  isDessert: boolean;
}

export interface BulkPlanningResult {
  written: number;
  skipped: number;
  writtenDesserts: number;
  skippedDesserts: number;
}

export interface CopyState {
  recipeId: string;
  slotType: SlotType;
  sourceDay: string;
  isDessert: boolean;
  recipeName: string;
  sourcePersons?: number;
  sourceFoodChoices?: FoodChoice[];
}

export interface ShoppingDay {
  year: number;
  week: number;
  day: string;
}
