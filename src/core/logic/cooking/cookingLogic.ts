import { COOKING_METHODS, CookingMethod, FoodCooking, FoodCookingInput, TEMPERATURE_COOKING_METHODS } from "../../domain/cooking";

export function compareCookingMethods(a: CookingMethod, b: CookingMethod): number {
  return COOKING_METHODS.indexOf(a) - COOKING_METHODS.indexOf(b);
}

export function cookingsByFood(cookings: readonly FoodCooking[]): Map<string, FoodCooking[]> {
  const byFood = new Map<string, FoodCooking[]>();
  for (const cooking of cookings) {
    const list = byFood.get(cooking.foodId);
    if (list) list.push(cooking);
    else byFood.set(cooking.foodId, [cooking]);
  }
  for (const list of byFood.values()) list.sort((a, b) => compareCookingMethods(a.method, b.method));
  return byFood;
}

export function acceptsTemperature(method: CookingMethod): boolean {
  return TEMPERATURE_COOKING_METHODS.includes(method);
}

export function isRawMethod(method: CookingMethod): boolean {
  return method === "raw";
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

export function formatCookingDuration(cooking: Pick<FoodCooking, "minMinutes" | "maxMinutes">): string | null {
  const { minMinutes, maxMinutes } = cooking;
  if (minMinutes === null) return null;
  if (maxMinutes === null || maxMinutes === minMinutes) return formatMinutes(minMinutes);
  if (maxMinutes < 60) return `${minMinutes}-${maxMinutes} min`;
  return `${formatMinutes(minMinutes)} à ${formatMinutes(maxMinutes)}`;
}

export function cookedGrams(rawGrams: number, cookedRatio: number): number {
  return rawGrams * cookedRatio;
}

export function formatCookedRatio(ratio: number): string {
  return `cuit ×${String(ratio).replace(".", ",")}`;
}

export function formatCookingSummary(cooking: FoodCookingInput): string {
  if (isRawMethod(cooking.method)) return cooking.note ? `Se mange cru · ${cooking.note}` : "Se mange cru";
  const duration = formatCookingDuration(cooking);
  return [
    duration,
    cooking.temperatureC !== null ? `${cooking.temperatureC} °C` : null,
    cooking.cookedRatio !== null ? formatCookedRatio(cooking.cookedRatio) : null,
    cooking.note,
  ].filter((part): part is string => !!part).join(" · ");
}
