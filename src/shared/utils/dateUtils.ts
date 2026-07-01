import {
  format,
  startOfISOWeek,
  addDays,
  getISOWeek,
  getISOWeekYear,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";

const WEEK_DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function isoDateFromWeekDay(year: number, week: number, dayName: string): string {
  const dayIndex = WEEK_DAY_ORDER.indexOf(dayName);
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

export const getWeekId = (date: Date = new Date()) => {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
};

export const getDaysOfWeek = (date: Date = new Date()) => {
  const start = startOfISOWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    return {
      key: format(day, "eeee").toLowerCase(),
      label: format(day, "EEEE d", { locale: fr }),
      date: day,
    };
  });
};

export const formatIsoDateShort = (iso: string): string => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export const formatDayDate = (monday: Date, dayIndex: number): string => {
  const d = addDays(monday, dayIndex);
  return format(d, "d MMM", { locale: fr });
};

export const formatBagDate = (iso: string): string =>
  format(parseISO(iso), "d MMM", { locale: fr });

export function formatNewsDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
