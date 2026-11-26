import { MealSlot, SlotType } from "../../domain/planning";
import { MEAL_SLOTS } from "../../domain/planningConfig";
import { PlannableItem } from "../../domain/recipe";

export interface WeekListMeal {
  slot: SlotType;
  names: string[];
  dessertCount: number;
}

export interface WeekListDay {
  day: string;
  meals: WeekListMeal[];
  isEmpty: boolean;
}

export function weekListDays(days: readonly string[], slots: readonly MealSlot[], items: Record<string, PlannableItem>): WeekListDay[] {
  return days.map((day) => {
    const meals = MEAL_SLOTS.map((def) => {
      const slot = slots.find((s) => s.day === day && s.slot === def.id);
      return {
        slot: def.id,
        names: (slot?.recipeIds ?? []).map((code) => items[code]?.name ?? code),
        dessertCount: slot?.dessertIds?.length ?? 0,
      };
    });
    return { day, meals, isEmpty: meals.every((meal) => meal.names.length === 0 && meal.dessertCount === 0) };
  });
}
