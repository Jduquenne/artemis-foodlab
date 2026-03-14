export { getISOWeek as getWeekNumber } from "date-fns";

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
