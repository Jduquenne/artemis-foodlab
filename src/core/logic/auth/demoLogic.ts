import { padNumber } from "../../../shared/utils/numberUtils";

export const DEMO_COUNTDOWN_TICK_MS = 15000;

export function demoRemainingMs(expiresAt: string, now: number): number {
  const end = Date.parse(expiresAt);
  if (Number.isNaN(end)) return 0;
  return Math.max(0, end - now);
}

export function formatDemoRemaining(remainingMs: number): string {
  const totalMinutes = Math.ceil(remainingMs / 60000);
  if (totalMinutes <= 1) return "moins d'une minute";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${padNumber(minutes, 2)}`;
}
