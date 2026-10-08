import { Food, UNIT_WEIGHT_UNITS, Unit } from "../../domain/ingredient";
import { Macronutrients } from "../../domain/nutrition";
import { MealSlot } from "../../domain/planning";
import { PlannableItem, RecipeDetails } from "../../domain/recipe";
import { getAllRecipeIds, isDish, isBase } from "../../domain/recipePredicates";

export const ZERO: Macronutrients = {
  kcal: 0,
  proteins: 0,
  lipids: 0,
  carbohydrates: 0,
  fibers: 0,
};

export function addMacros(a: Macronutrients, b: Macronutrients): Macronutrients {
  return {
    kcal: a.kcal + b.kcal,
    proteins: a.proteins + b.proteins,
    lipids: a.lipids + b.lipids,
    carbohydrates: a.carbohydrates + b.carbohydrates,
    fibers: a.fibers + b.fibers,
  };
}

export function scaleMacros(m: Macronutrients, factor: number): Macronutrients {
  return {
    kcal: m.kcal * factor,
    proteins: m.proteins * factor,
    lipids: m.lipids * factor,
    carbohydrates: m.carbohydrates * factor,
    fibers: m.fibers * factor,
  };
}

export function toGrams(
  quantity: number,
  unit: Unit,
  unitWeight?: number | null,
): number | null {
  switch (unit) {
    case Unit.G:
      return quantity;
    case Unit.KG:
      return quantity * 1000;
    case Unit.ML:
      return quantity;
    default:
      return UNIT_WEIGHT_UNITS.includes(unit) && unitWeight != null ? quantity * unitWeight : null;
  }
}

export function calculateRecipeMacros(
  recipe: RecipeDetails,
  allRecipes: Record<string, RecipeDetails>,
  foodDb: Record<string, Food>,
): Macronutrients {
  let total = { ...ZERO };

  for (const ingredient of recipe.ingredients) {
    if (ingredient.quantity == null) continue;

    if (ingredient.foodId) {
      const food = foodDb[ingredient.foodId];
      if (!food) continue;
      const grams = toGrams(ingredient.quantity, ingredient.unit, food.unitWeight);
      if (grams == null) continue;
      total = addMacros(total, scaleMacros(food.macros, grams / 100));
    } else if (ingredient.baseId) {
      const base = allRecipes[ingredient.baseId];
      if (!base) continue;
      const baseMacrosPerPortion = calculateRecipeMacros(base, allRecipes, foodDb);
      total = addMacros(total, scaleMacros(baseMacrosPerPortion, ingredient.quantity));
    }
  }

  return scaleMacros(total, 1 / recipe.defaultPortions);
}

export function calculateOverriddenRecipeMacros(
  recipe: RecipeDetails,
  ingredientOverrides: Record<string, number>,
  allRecipes: Record<string, RecipeDetails>,
  foodDb: Record<string, Food>,
): Macronutrients {
  const ingredients = recipe.ingredients.map((ing) =>
    ing.id in ingredientOverrides ? { ...ing, quantity: ingredientOverrides[ing.id] } : ing,
  );
  return calculateRecipeMacros({ ...recipe, ingredients, defaultPortions: 1 }, allRecipes, foodDb);
}

export function calculateRecipeBaseGrams(recipe: RecipeDetails, foodDb: Record<string, Food>): number {
  let total = 0;
  for (const ing of recipe.ingredients) {
    if (ing.quantity == null) continue;
    const food = ing.foodId ? foodDb[ing.foodId] : undefined;
    const grams = toGrams(ing.quantity, ing.unit, food?.unitWeight);
    if (grams != null) total += grams;
  }
  return total > 0 ? total / recipe.defaultPortions : 0;
}

export interface MacroCatalogue {
  plannable: Record<string, PlannableItem>;
  recipes: Record<string, RecipeDetails>;
  foods: Record<string, Food>;
  recipeMacros: Record<string, Macronutrients>;
  baseGrams: Record<string, number>;
}

export function computeItemMacros(
  catalogue: MacroCatalogue,
  recipeId: string,
  itemKey: string,
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
  ingredientOverrides: Record<string, Record<string, number>> = {},
): Macronutrients {
  const recipe = catalogue.plannable[recipeId];
  const itemIngredientOverrides = ingredientOverrides[itemKey];
  const fullRecipe = catalogue.recipes[recipeId];
  if (fullRecipe && itemIngredientOverrides && Object.keys(itemIngredientOverrides).length > 0) {
    return calculateOverriddenRecipeMacros(fullRecipe, itemIngredientOverrides, catalogue.recipes, catalogue.foods);
  }
  const m = catalogue.recipeMacros[recipeId];
  if (!m) return { ...ZERO };
  const baseGrams = catalogue.baseGrams[recipeId];
  if (!isDish(recipe) && !isBase(recipe) && baseGrams) {
    return scaleMacros(m, (gramOverrides[itemKey] ?? baseGrams) / baseGrams);
  }
  return scaleMacros(m, portionOverrides[itemKey] ?? 1);
}

export function computeSlotMacros(
  catalogue: MacroCatalogue,
  slot: MealSlot,
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
  ingredientOverrides: Record<string, Record<string, number>> = {},
): Macronutrients {
  return getAllRecipeIds(slot).reduce(
    (sum, id) =>
      addMacros(
        sum,
        computeItemMacros(catalogue, id, slot.itemApiIds?.[id] ?? "", portionOverrides, gramOverrides, ingredientOverrides),
      ),
    { ...ZERO },
  );
}

export function computeDayMacros(
  catalogue: MacroCatalogue,
  slots: MealSlot[],
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
  ingredientOverrides: Record<string, Record<string, number>> = {},
): Macronutrients {
  return slots.reduce(
    (total, slot) => addMacros(total, computeSlotMacros(catalogue, slot, portionOverrides, gramOverrides, ingredientOverrides)),
    { ...ZERO },
  );
}
