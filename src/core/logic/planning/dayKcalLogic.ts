import { DAYS } from "../../domain/planningConfig";
import { MealSlot } from "../../domain/planning";
import { MacroCatalogue, MacroProfile, computeDayMacros } from "../nutrition/macroLogic";

export function weekDayKcal(
  catalogue: MacroCatalogue,
  slots: readonly MealSlot[],
  profile: MacroProfile | undefined,
): Record<string, number> {
  return Object.fromEntries(
    DAYS.map((day) => {
      const daySlots = slots.filter((slot) => slot.day === day);
      const kcal = daySlots.length > 0 ? computeDayMacros(catalogue, daySlots, {}, {}, {}, profile).kcal : 0;
      return [day, Math.round(kcal)];
    }),
  );
}
