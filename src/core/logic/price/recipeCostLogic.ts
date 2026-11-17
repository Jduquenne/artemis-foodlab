import { Food } from "../../domain/ingredient";
import { FoodPrice } from "../../domain/price";
import { RecipeDetails } from "../../domain/recipe";
import { basePortionsOf } from "../recipe/cookedWeightLogic";
import { CostEstimate, PricedLine, estimateCost, lineCost } from "./priceLogic";

export interface RecipeCostLine extends PricedLine {
  baseName?: string;
  cost: number | null;
}

export interface RecipeCost {
  total: CostEstimate;
  perPortion: number;
  lines: RecipeCostLine[];
}

interface SourcedLine extends PricedLine {
  baseName?: string;
}

function recipeLines(
  recipe: RecipeDetails,
  scale: number,
  recipes: Record<string, RecipeDetails>,
  visited: ReadonlySet<string>,
  keyPrefix: string,
  baseName?: string,
): SourcedLine[] {
  const lines: SourcedLine[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.quantity == null) continue;
    if (ing.baseId) {
      const base = recipes[ing.baseId];
      if (!base || visited.has(ing.baseId) || base.defaultPortions <= 0) continue;
      const basePortions = basePortionsOf(ing.quantity, ing.unit, base);
      if (basePortions === null) continue;
      const baseScale = (scale * basePortions) / base.defaultPortions;
      lines.push(...recipeLines(base, baseScale, recipes, new Set([...visited, ing.baseId]), `${keyPrefix}${ing.id}/`, baseName ?? base.name));
      continue;
    }
    lines.push({
      key: `${keyPrefix}${ing.id}`,
      name: ing.name,
      foodId: ing.foodId,
      quantity: ing.quantity * scale,
      unit: ing.unit,
      ...(baseName && { baseName }),
    });
  }
  return lines;
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
  if (recipe.defaultPortions <= 0 || portions <= 0) return null;
  const lines = recipeLines(recipe, portions / recipe.defaultPortions, recipes, new Set([recipe.code]), "")
    .filter((line) => line.quantity > 0);
  if (lines.length === 0) return null;
  const total = estimateCost(lines, foods, prices);
  return {
    total,
    perPortion: total.total / portions,
    lines: sortRecipeCostLines(lines.map((line) => ({ ...line, cost: lineCost(line, foods, prices) }))),
  };
}
