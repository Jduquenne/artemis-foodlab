export function toNumber(value: unknown): number {
  return Number(value) || 0;
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function padNumber(value: number, width: number): string {
  return String(value).padStart(width, "0");
}
