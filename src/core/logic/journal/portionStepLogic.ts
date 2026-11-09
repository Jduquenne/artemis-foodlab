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
