const INVARIABLE_UNITS = new Set(['', 'g', 'kg', 'ml', 'cl', 'l', 'cc', 'c', 'tiers']);

export function pluralizeUnit(unit: string, quantity: number): string {
  if (quantity <= 1 || INVARIABLE_UNITS.has(unit)) return unit;
  return unit + 's';
}

export function formatQty(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}
