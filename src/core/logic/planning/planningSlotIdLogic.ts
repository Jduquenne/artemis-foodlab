import { SlotType } from "../../domain/planning";
import { MEAL_SLOTS } from "../../domain/planningConfig";

export interface ParsedSlot {
  year: number;
  week: number;
  day: string;
  slot: SlotType;
}

export function buildSlotId(year: number, week: number, day: string, slot: SlotType): string {
  return `${year}-W${week}-${day}-${slot}`;
}

export function parseFullSlotId(fullId: string): ParsedSlot | null {
  const wIdx = fullId.indexOf('-W');
  if (wIdx === -1) return null;
  const yearStr = fullId.slice(0, wIdx);
  const rest = fullId.slice(wIdx + 2);
  const dashIdx = rest.indexOf('-');
  if (dashIdx === -1) return null;
  const weekStr = rest.slice(0, dashIdx);
  const daySlot = rest.slice(dashIdx + 1);
  for (const m of MEAL_SLOTS) {
    if (daySlot.endsWith(`-${m.id}`)) {
      return {
        year: parseInt(yearStr, 10),
        week: parseInt(weekStr, 10),
        day: daySlot.slice(0, daySlot.length - m.id.length - 1),
        slot: m.id,
      };
    }
  }
  return null;
}
