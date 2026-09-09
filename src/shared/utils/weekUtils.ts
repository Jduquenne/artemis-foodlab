import { getISOWeek, getISOWeekYear } from "date-fns";

export { getISOWeek as getWeekNumber } from "date-fns";

export const parseIsoWeek = (value: string): { year: number; week: number } | null => {
  const match = /^(\d{4})-W(\d{1,2})$/.exec(value);
  return match ? { year: Number(match[1]), week: Number(match[2]) } : null;
};

export const weeksSinceIsoWeek = (value: string, now = new Date()): number | null => {
  const parsed = parseIsoWeek(value);
  if (!parsed) return null;
  return (getISOWeekYear(now) - parsed.year) * 52 + (getISOWeek(now) - parsed.week);
};

export const formatWeeksAgo = (weeks: number | null): string => {
  if (weeks === null) return "";
  if (weeks <= 0) return "cette semaine";
  if (weeks === 1) return "sem. dernière";
  if (weeks < 12) return `il y a ${weeks} sem.`;
  const months = Math.round(weeks / 4.345);
  return months < 12 ? `il y a ${months} mois` : `il y a ${Math.round(months / 12)} an${months >= 24 ? "s" : ""}`;
};

export const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export const formatDateShort = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const getWeekRange = (monday: Date) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${formatDateShort(monday)} au ${formatDateShort(sunday)}`;
};
