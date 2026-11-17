import { RecipeDetails } from "../../domain/recipe";
import { basePortionsOf } from "./cookedWeightLogic";

export interface FlatRecipeLine {
  key: string;
  name: string;
  foodId?: string;
  quantity: number;
  unit: string;
  baseName?: string;
}

function collectLines(
  recipe: RecipeDetails,
  scale: number,
  recipes: Record<string, RecipeDetails>,
  visited: ReadonlySet<string>,
  keyPrefix: string,
  baseName?: string,
): FlatRecipeLine[] {
  const lines: FlatRecipeLine[] = [];
  for (const ing of recipe.ingredients) {
    if (ing.quantity == null) continue;
    if (ing.baseId) {
      const base = recipes[ing.baseId];
      if (!base || visited.has(ing.baseId) || base.defaultPortions <= 0) continue;
      const basePortions = basePortionsOf(ing.quantity, ing.unit, base);
      if (basePortions === null) continue;
      const baseScale = (scale * basePortions) / base.defaultPortions;
      lines.push(...collectLines(base, baseScale, recipes, new Set([...visited, ing.baseId]), `${keyPrefix}${ing.id}/`, baseName ?? base.name));
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

export function flattenRecipeLines(
  recipe: RecipeDetails,
  portions: number,
  recipes: Record<string, RecipeDetails>,
): FlatRecipeLine[] {
  if (recipe.defaultPortions <= 0 || portions <= 0) return [];
  return collectLines(recipe, portions / recipe.defaultPortions, recipes, new Set([recipe.code]), "")
    .filter((line) => line.quantity > 0);
}
