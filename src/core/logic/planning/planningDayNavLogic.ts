import { DAYS } from "../../domain/planningConfig";

export function shiftDay(day: string, direction: 1 | -1): { day: string; weekOffset: -1 | 0 | 1 } {
  const index = (DAYS as readonly string[]).indexOf(day) + direction;
  if (index < 0) return { day: DAYS[DAYS.length - 1], weekOffset: -1 };
  if (index >= DAYS.length) return { day: DAYS[0], weekOffset: 1 };
  return { day: DAYS[index], weekOffset: 0 };
}
