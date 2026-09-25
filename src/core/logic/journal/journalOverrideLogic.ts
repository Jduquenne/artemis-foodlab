import { Ingredient, Unit } from "../../domain/ingredient";
import { RecipeDetails } from "../../domain/recipe";
import { ApiJournalOverride, JournalOverrides } from "../../services/journalService";
import { omitKey } from "../../../shared/utils/collectionUtils";
import { roundTo } from "../../../shared/utils/numberUtils";

export const EMPTY_JOURNAL_OVERRIDES: JournalOverrides = {
  portionOverrides: {},
  gramOverrides: {},
  ingredientOverrides: {},
};

export function isOverridableIngredient(ingredient: Ingredient): boolean {
  return ingredient.quantity != null && ingredient.unit !== Unit.NONE;
}

export function scaleIngredientsByRatio(recipe: RecipeDetails, ratio: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const ingredient of recipe.ingredients) {
    if (ingredient.quantity == null || ingredient.unit === Unit.NONE) continue;
    result[ingredient.id] = roundTo(ingredient.quantity * ratio, 2);
  }
  return result;
}

export function defaultIngredientOverridesForPortions(
  recipe: RecipeDetails | undefined,
  portions: number,
): Record<string, number> {
  if (!recipe || recipe.defaultPortions <= 0) return {};
  return scaleIngredientsByRatio(recipe, portions / recipe.defaultPortions);
}

export function applyOverrideResult(
  current: JournalOverrides,
  planningSlotItemId: string,
  result: ApiJournalOverride,
): JournalOverrides {
  return {
    portionOverrides:
      result.portionsOverride != null
        ? { ...current.portionOverrides, [planningSlotItemId]: result.portionsOverride }
        : omitKey(current.portionOverrides, planningSlotItemId),
    gramOverrides:
      result.gramsOverride != null
        ? { ...current.gramOverrides, [planningSlotItemId]: result.gramsOverride }
        : omitKey(current.gramOverrides, planningSlotItemId),
    ingredientOverrides:
      result.ingredientOverrides.length > 0
        ? {
            ...current.ingredientOverrides,
            [planningSlotItemId]: Object.fromEntries(
              result.ingredientOverrides.map((i) => [i.recipeIngredientId, i.gramsOverride]),
            ),
          }
        : omitKey(current.ingredientOverrides, planningSlotItemId),
  };
}
