import { Food, Macronutrients, MealSlot, RecipeDetails, Unit } from "../../core/domain/types";
import { getAllRecipeIds, isDish, isBase } from "../../core/domain/recipePredicates";
import { typedRecipesDb } from "../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../core/typed-db/typedFoodDb";
import { plannableDb } from "../../core/typed-db/plannableDb";

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
  unitWeight?: number,
): number | null {
  switch (unit) {
    case Unit.G:
      return quantity;
    case Unit.KG:
      return quantity * 1000;
    case Unit.ML:
      return quantity;
    case Unit.PIECE:
    case Unit.PORTION:
    case Unit.TRANCHE:
    case Unit.FEUILLE:
    case Unit.SACHET:
      return unitWeight != null ? quantity * unitWeight : null;
    default:
      return null;
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

function calculateRecipeBaseGrams(recipe: RecipeDetails, foodDb: Record<string, Food>): number {
  let total = 0;
  for (const ing of recipe.ingredients) {
    if (ing.quantity == null) continue;
    const food = ing.foodId ? foodDb[ing.foodId] : undefined;
    const grams = toGrams(ing.quantity, ing.unit, food?.unitWeight);
    if (grams != null) total += grams;
  }
  return total > 0 ? total / recipe.defaultPortions : 0;
}

export const RECIPE_MACROS: Record<string, Macronutrients> = {};
export const RECIPE_BASE_GRAMS: Record<string, number> = {};

export function refreshRecipeMacros(
  allRecipes: Record<string, RecipeDetails>,
  foodDb: Record<string, Food>,
): void {
  for (const key of Object.keys(RECIPE_MACROS)) delete RECIPE_MACROS[key];
  for (const key of Object.keys(RECIPE_BASE_GRAMS)) delete RECIPE_BASE_GRAMS[key];

  for (const [id, recipe] of Object.entries(allRecipes)) {
    try {
      RECIPE_MACROS[id] = calculateRecipeMacros(recipe, allRecipes, foodDb);
    } catch {
      /* recipe has unresolvable ingredients (missing foodId / baseId) — skip silently */
    }
    const grams = calculateRecipeBaseGrams(recipe, foodDb);
    if (grams > 0) RECIPE_BASE_GRAMS[id] = grams;
  }
}

refreshRecipeMacros(typedRecipesDb, typedFoodDb);

export function computeSlotMacros(
  slot: MealSlot,
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
): Macronutrients {
  return getAllRecipeIds(slot).reduce((sum, id) => {
    const m = RECIPE_MACROS[id];
    if (!m) return sum;
    const key = slot.itemApiIds?.[id] ?? "";
    const recipe = plannableDb[id];
    const baseGrams = RECIPE_BASE_GRAMS[id];
    let factor: number;
    if (!isDish(recipe) && !isBase(recipe) && baseGrams) {
      const grams = gramOverrides[key] ?? baseGrams;
      factor = grams / baseGrams;
    } else {
      factor = portionOverrides[key] ?? 1;
    }
    return addMacros(sum, scaleMacros(m, factor));
  }, { ...ZERO });
}

export function computeDayMacros(
  slots: MealSlot[],
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
): Macronutrients {
  return slots.reduce(
    (total, slot) => addMacros(total, computeSlotMacros(slot, portionOverrides, gramOverrides)),
    { ...ZERO },
  );
}
