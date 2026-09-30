export const REFRESH_RETRY_DELAYS_MS: readonly number[] = [2000, 4000, 8000, 15000, 30000];

const REJECTION_STATUSES: readonly number[] = [400, 401, 403];

export function isRefreshRejected(status: number | null): boolean {
  return status !== null && REJECTION_STATUSES.includes(status);
}
