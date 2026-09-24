export const resolveRestoredCount = (
  saved: number | undefined,
  batchSize: number,
  total: number,
): number => Math.min(Math.max(saved ?? 0, batchSize), Math.max(total, batchSize));
