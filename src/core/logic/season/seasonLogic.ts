export const MONTH_COUNT = 12;

export const MONTH_INITIALS: readonly string[] = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const MONTH_SHORT_LABELS: readonly string[] = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export const ALL_YEAR_LABEL = "Toute l'année";

export function normalizeMonths(months: readonly number[]): number[] {
  const unique = [...new Set(months)]
    .filter((m) => Number.isInteger(m) && m >= 1 && m <= MONTH_COUNT)
    .sort((a, b) => a - b);
  return unique.length === MONTH_COUNT ? [] : unique;
}

export const ALL_MONTHS: readonly number[] = Array.from({ length: MONTH_COUNT }, (_, index) => index + 1);

export function checkedMonths(months: readonly number[] | undefined): readonly number[] {
  const normalized = normalizeMonths(months ?? []);
  return normalized.length === 0 ? ALL_MONTHS : normalized;
}

export function toggleMonth(months: readonly number[], month: number): number[] {
  const checked = checkedMonths(months);
  const next = checked.includes(month) ? checked.filter((m) => m !== month) : [...checked, month];
  return next.length === 0 ? normalizeMonths(months) : normalizeMonths(next);
}

export function sameMonths(a: readonly number[], b: readonly number[]): boolean {
  const left = normalizeMonths(a);
  const right = normalizeMonths(b);
  return left.length === right.length && left.every((m, index) => m === right[index]);
}

function nextMonth(month: number): number {
  return (month % MONTH_COUNT) + 1;
}

function previousMonth(month: number): number {
  return ((month + MONTH_COUNT - 2) % MONTH_COUNT) + 1;
}

function monthRanges(months: readonly number[]): [number, number][] {
  const set = new Set(normalizeMonths(months));
  const starts = [...set].filter((m) => !set.has(previousMonth(m)));
  return starts.map((start) => {
    let end = start;
    while (set.has(nextMonth(end))) end = nextMonth(end);
    return [start, end];
  });
}

export function formatMonths(months: readonly number[] | undefined): string {
  const ranges = monthRanges(months ?? []);
  if (ranges.length === 0) return ALL_YEAR_LABEL;
  return ranges
    .map(([start, end]) => (start === end
      ? MONTH_SHORT_LABELS[start - 1]
      : `${MONTH_SHORT_LABELS[start - 1]} → ${MONTH_SHORT_LABELS[end - 1]}`))
    .join(", ");
}

export function hasSeason(months: readonly number[] | undefined): boolean {
  return normalizeMonths(months ?? []).length > 0;
}
