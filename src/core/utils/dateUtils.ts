import {
  format,
  startOfISOWeek,
  addDays,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { DAYS } from "../domain/planningConfig";

export const toIsoDate = (date: Date): string => format(date, "yyyy-MM-dd");

export function isoDateFromWeekDay(year: number, week: number, dayName: string): string {
  const dayIndex = (DAYS as readonly string[]).indexOf(dayName);
  const week1Monday = startOfISOWeek(new Date(year, 0, 4));
  return format(addDays(week1Monday, (week - 1) * 7 + Math.max(0, dayIndex)), 'yyyy-MM-dd');
}

export function formatSourceDayFull(isoDate: string): string {
  const s = format(parseISO(isoDate), "EEEE d MMMM", { locale: fr });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatSourceDayShort(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM", { locale: fr });
}

export const formatDayDate = (monday: Date, dayIndex: number): string => {
  const d = addDays(monday, dayIndex);
  return format(d, "d MMM", { locale: fr });
};

export const formatBagDate = (iso: string): string =>
  format(parseISO(iso), "d MMM", { locale: fr });

export const formatDateMedium = (iso: string): string =>
  format(parseISO(iso), "d MMM yyyy", { locale: fr });

export function formatNewsDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
