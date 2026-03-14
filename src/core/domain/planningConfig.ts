import { SlotType } from "./types";

export const MEAL_SLOTS = [
  { id: "breakfast" as SlotType, label: "Petit déj.", icon: "☕", multi: true, flex: 2, hasDessert: false },
  { id: "lunch" as SlotType, label: "Déjeuner", icon: "🍴", multi: false, flex: 3, hasDessert: true },
  { id: "snack" as SlotType, label: "Goûter", icon: "🍎", multi: true, flex: 2, hasDessert: false },
  { id: "dinner" as SlotType, label: "Dîner", icon: "🌙", multi: false, flex: 3, hasDessert: true },
] as const;

export type MealSlotDef = typeof MEAL_SLOTS[number];

export interface CopyState {
  recipeId: string;
  slotType: SlotType;
  sourceDay: string;
  isDessert: boolean;
  recipeName: string;
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;
export type DayName = typeof DAYS[number];
