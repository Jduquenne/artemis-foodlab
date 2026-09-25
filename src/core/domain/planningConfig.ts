import { SlotType } from "./planning";

export const MEAL_SLOTS = [
  { id: "breakfast", multi: true, hasDessert: false },
  { id: "lunch", multi: false, hasDessert: true },
  { id: "snack", multi: true, hasDessert: false },
  { id: "dinner", multi: false, hasDessert: true },
] as const satisfies readonly { id: SlotType; multi: boolean; hasDessert: boolean }[];

export const MAX_DESSERTS_PER_SLOT = 3;
export const MAX_RECIPES_PER_SLOT = 4;

export type MealSlotDef = typeof MEAL_SLOTS[number];

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;
