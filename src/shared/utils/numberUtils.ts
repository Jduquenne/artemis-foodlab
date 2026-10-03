export function toNumber(value: unknown): number {
  return Number(value) || 0;
}

export function parseDecimal(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function padNumber(value: number, width: number): string {
  return String(value).padStart(width, "0");
}
