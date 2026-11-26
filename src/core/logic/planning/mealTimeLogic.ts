import { MealTimeRange, MealTimes } from "../../domain/mealTimes";
import { SlotType } from "../../domain/planning";
import { MEAL_SLOTS } from "../../domain/planningConfig";
import { SLOT_LABELS } from "../../domain/slotLabels";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function minutesOf(time: string): number | null {
  const match = TIME_PATTERN.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function isMealOver(range: MealTimeRange, now: Date): boolean {
  const end = minutesOf(range.end);
  return end !== null && now.getHours() * 60 + now.getMinutes() >= end;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return minutes === "00" ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}

export function formatMealTime(range: MealTimeRange): string {
  return `${formatTime(range.start)} – ${formatTime(range.end)}`;
}

export function mealTimesErrors(times: MealTimes): string[] {
  return MEAL_SLOTS.flatMap((def) => {
    const range = times[def.id];
    const start = minutesOf(range.start);
    const end = minutesOf(range.end);
    if (start === null || end === null) return [`${SLOT_LABELS[def.id]} : indique une heure de début et de fin.`];
    return end > start ? [] : [`${SLOT_LABELS[def.id]} : l'heure de fin doit être après l'heure de début.`];
  });
}

export function withMealTime(times: MealTimes, slot: SlotType, field: keyof MealTimeRange, value: string): MealTimes {
  return { ...times, [slot]: { ...times[slot], [field]: value } };
}
