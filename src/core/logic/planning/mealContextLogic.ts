import { SlotType } from "../../domain/planning";
import { DAYS, MEAL_SLOTS } from "../../domain/planningConfig";

export interface MealContext {
  day: string;
  slot: SlotType;
  persons: number | null;
}

const MOMENT_LABELS: Record<SlotType, string> = {
  breakfast: "matin",
  lunch: "midi",
  snack: "goûter",
  dinner: "soir",
};

const isSlotType = (value: string): value is SlotType => MEAL_SLOTS.some((def) => def.id === value);

export function encodeMealContext(context: MealContext): string {
  return [context.day, context.slot, context.persons ?? ""].join(".");
}

export function parseMealContext(value: string | null): MealContext | null {
  if (!value) return null;
  const [day, slot, persons] = value.split(".");
  if (!day || !slot || !(DAYS as readonly string[]).includes(day) || !isSlotType(slot)) return null;
  const count = Number(persons);
  return { day, slot, persons: Number.isInteger(count) && count > 0 ? count : null };
}

export function mealContextLabel(context: MealContext): string {
  const persons = context.persons === null ? "" : ` · ${context.persons} personne${context.persons > 1 ? "s" : ""}`;
  return `À cuisiner pour ${context.day.toLowerCase()} ${MOMENT_LABELS[context.slot]}${persons}`;
}
