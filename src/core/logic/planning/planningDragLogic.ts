import { MealSlot } from "../../domain/planning";
import { MAX_DESSERTS_PER_SLOT } from "../../domain/planningConfig";
import { ParsedSlot } from "./planningSlotIdLogic";

export type DragMoveMode = "move" | "swap";

export interface DragMoveRequest {
  from: ParsedSlot;
  to: ParsedSlot;
  mode: DragMoveMode;
  moveDesserts: boolean;
  keptDessertIds: string[] | null;
}

export function dragMoveMode(toMeal: MealSlot | undefined): DragMoveMode {
  return (toMeal?.recipeIds.length ?? 0) > 0 ? "swap" : "move";
}

export function incomingDessertChoice(fromMeal: MealSlot, toMeal: MealSlot | undefined): string[] | null {
  if (!toMeal || toMeal.recipeIds.length > 0) return null;
  const merged = [...new Set([...(toMeal.dessertIds ?? []), ...(fromMeal.dessertIds ?? [])])];
  return merged.length > MAX_DESSERTS_PER_SLOT ? merged : null;
}
