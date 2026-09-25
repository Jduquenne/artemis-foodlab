export function computePricePerKg(weightGrams: number, price: number): number | null {
  if (!Number.isFinite(weightGrams) || !Number.isFinite(price) || weightGrams <= 0 || price <= 0) return null;
  return (price / weightGrams) * 1000;
}
