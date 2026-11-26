import { RecipeDetails } from "../../domain/recipe";
import { ConsolidatedIngredient } from "../../domain/shopping";

export interface RecipeToFix {
  code: string;
  name: string;
}

export function isUnlinkedMealLine(item: ConsolidatedIngredient): boolean {
  return item.origin === "meal" && !item.foodId;
}

export function recipesToFix(item: ConsolidatedIngredient, recipes: Record<string, RecipeDetails>): RecipeToFix[] {
  const seen = new Set<string>();
  const result: RecipeToFix[] = [];
  for (const source of item.sources) {
    const code = source.fromBaseId ?? source.recipeId;
    const recipe = recipes[code];
    if (seen.has(code) || !recipe) continue;
    seen.add(code);
    result.push({ code, name: recipe.name });
  }
  return result;
}
