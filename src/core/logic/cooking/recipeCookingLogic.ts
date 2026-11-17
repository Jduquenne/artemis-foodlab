import { FoodCooking } from "../../domain/cooking";
import { Food } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { toGrams } from "../nutrition/macroLogic";
import { flattenRecipeLines } from "../recipe/recipeFlattenLogic";
import { parseUnit } from "../unit/unitLogic";
import { cookedGrams } from "./cookingLogic";

export interface RecipeCookingRow {
  key: string;
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  rawGrams: number | null;
  baseNames: string[];
  cookings: FoodCooking[];
}

export function recipeCookingRows(
  recipe: RecipeDetails,
  portions: number,
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  cookingsByFood: Map<string, FoodCooking[]>,
): RecipeCookingRow[] {
  const rows = new Map<string, RecipeCookingRow>();
  for (const line of flattenRecipeLines(recipe, portions, recipes)) {
    const cookings = line.foodId ? cookingsByFood.get(line.foodId) : undefined;
    if (!line.foodId || !cookings || cookings.length === 0) continue;
    const key = `${line.foodId}-${line.unit}`;
    const existing = rows.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      if (line.baseName && !existing.baseNames.includes(line.baseName)) existing.baseNames.push(line.baseName);
      continue;
    }
    rows.set(key, {
      key,
      foodId: line.foodId,
      name: foods[line.foodId]?.name ?? line.name,
      quantity: line.quantity,
      unit: line.unit,
      rawGrams: null,
      baseNames: line.baseName ? [line.baseName] : [],
      cookings,
    });
  }
  return [...rows.values()].map((row) => ({
    ...row,
    rawGrams: toGrams(row.quantity, parseUnit(row.unit), foods[row.foodId]?.unitWeight),
  }));
}

export interface CookedEquivalent {
  method: FoodCooking["method"];
  grams: number;
}

export function cookedEquivalents(
  quantity: number | null,
  unit: string,
  food: Food | undefined,
  cookings: readonly FoodCooking[],
): CookedEquivalent[] {
  if (quantity === null || quantity <= 0 || !food) return [];
  const rawGrams = toGrams(quantity, parseUnit(unit), food.unitWeight);
  if (rawGrams === null) return [];
  return cookings
    .filter((cooking) => cooking.cookedRatio !== null)
    .map((cooking) => ({ method: cooking.method, grams: cookedGrams(rawGrams, cooking.cookedRatio ?? 0) }));
}

export function cookedGramsOf(row: Pick<RecipeCookingRow, "rawGrams">, cooking: Pick<FoodCooking, "cookedRatio">): number | null {
  if (row.rawGrams === null || cooking.cookedRatio === null) return null;
  return cookedGrams(row.rawGrams, cooking.cookedRatio);
}
