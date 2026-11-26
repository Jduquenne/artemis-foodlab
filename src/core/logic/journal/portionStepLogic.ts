export const MIN_JOURNAL_PORTIONS = 1;
export const MAX_JOURNAL_PORTIONS = 10;

export function maxJournalPortions(reference: number): number {
  return Math.max(MAX_JOURNAL_PORTIONS, Math.ceil(reference * 2));
}

export function stepJournalPortions(current: number, direction: 1 | -1, reference: number): number | null {
  if (direction === 1) {
    const next = Math.floor(current) + 1;
    return next > maxJournalPortions(reference) ? null : next;
  }
  if (current <= MIN_JOURNAL_PORTIONS) return null;
  return Math.max(MIN_JOURNAL_PORTIONS, Math.ceil(current) - 1);
}

export const JOURNAL_PORTION_NUDGE = 0.25;

export function nudgeJournalPortions(current: number, direction: 1 | -1, reference: number): number | null {
  const step = reference * JOURNAL_PORTION_NUDGE;
  const next = Math.round((current + direction * step) * 100) / 100;
  if (next < step - 0.001 || next > maxJournalPortions(reference)) return null;
  return next;
}
