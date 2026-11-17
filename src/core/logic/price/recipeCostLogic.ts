import { Food } from "../../domain/ingredient";
import { FoodPrice } from "../../domain/price";
import { RecipeDetails } from "../../domain/recipe";
import { FlatRecipeLine, flattenRecipeLines } from "../recipe/recipeFlattenLogic";
import { CostEstimate, estimateCost, lineCost } from "./priceLogic";

export interface RecipeCostLine extends FlatRecipeLine {
  cost: number | null;
}

export interface RecipeCost {
  total: CostEstimate;
  perPortion: number;
  lines: RecipeCostLine[];
}

export function sortRecipeCostLines(lines: readonly RecipeCostLine[]): RecipeCostLine[] {
  return [...lines].sort((a, b) => {
    if (a.cost === null || b.cost === null) {
      if (a.cost === b.cost) return a.name.localeCompare(b.name, "fr");
      return a.cost === null ? 1 : -1;
    }
    return b.cost - a.cost;
  });
}

export function recipeCost(
  recipe: RecipeDetails,
  portions: number,
  recipes: Record<string, RecipeDetails>,
  foods: Record<string, Food>,
  prices: Map<string, FoodPrice>,
): RecipeCost | null {
  const lines = flattenRecipeLines(recipe, portions, recipes);
  if (lines.length === 0) return null;
  const total = estimateCost(lines, foods, prices);
  return {
    total,
    perPortion: total.total / portions,
    lines: sortRecipeCostLines(lines.map((line) => ({ ...line, cost: lineCost(line, foods, prices) }))),
  };
}
