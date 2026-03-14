import {
  format,
  startOfISOWeek,
  addDays,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import { fr } from "date-fns/locale";

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
