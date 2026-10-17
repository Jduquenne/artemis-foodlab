import { MealReason } from "../../domain/menuGenerator";
import { RecipeDetails } from "../../domain/recipe";
import { FreezerBatchStock } from "../freezer/freezerStockLogic";

export interface FreezerPlanEntry {
  recipeCode: string;
  remainingMeals: number;
  portionsPerMeal: number;
  remainingPortions: number;
  lastIndex: number | null;
}

export interface FreezerPlan {
  entries: FreezerPlanEntry[];
}

export interface FreezerSlotContext {
  candidates: readonly RecipeDetails[];
  index: number;
  previousCategoryId: string | null;
  sameDayCategoryIds: readonly string[];
}

export function createFreezerPlan(
  stocks: readonly FreezerBatchStock[],
  householdSize: number,
  alreadyPlannedCodes: readonly string[],
): FreezerPlan {
  const portionsPerMeal = Math.max(1, householdSize);
  const entries = stocks
    .map((stock) => {
      const planned = alreadyPlannedCodes.filter((code) => code === stock.recipeCode).length;
      const remainingMeals = Math.floor(stock.portions / portionsPerMeal) - planned;
      return {
        recipeCode: stock.recipeCode,
        remainingMeals,
        portionsPerMeal,
        remainingPortions: stock.portions - planned * portionsPerMeal,
        lastIndex: null,
      };
    })
    .filter((entry) => entry.remainingMeals > 0);
  return { entries };
}

export function takeFreezerMeal(
  plan: FreezerPlan,
  context: FreezerSlotContext,
): { recipe: RecipeDetails; reason: MealReason } | null {
  const byCode = new Map(context.candidates.map((recipe) => [recipe.code, recipe]));
  for (const entry of plan.entries) {
    const recipe = byCode.get(entry.recipeCode);
    if (!recipe || entry.remainingMeals <= 0) continue;
    if (recipe.categoryId === context.previousCategoryId) continue;
    if (context.sameDayCategoryIds.includes(recipe.categoryId)) continue;
    if (entry.lastIndex !== null && context.index - entry.lastIndex < 3) continue;
    entry.remainingMeals -= 1;
    entry.remainingPortions -= entry.portionsPerMeal;
    entry.lastIndex = context.index;
    return {
      recipe,
      reason: {
        kind: "freezer",
        label: `Au congélateur : ${entry.portionsPerMeal} portion${entry.portionsPerMeal > 1 ? "s" : ""} utilisée${entry.portionsPerMeal > 1 ? "s" : ""}, ${entry.remainingPortions} restante${entry.remainingPortions > 1 ? "s" : ""}`,
      },
    };
  }
  return null;
}
