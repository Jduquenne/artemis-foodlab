import { Food, Macronutrients, MealSlot, RecipeDetails, Unit } from "../domain/types";
import { getAllRecipeIds, isDish, isBase } from "../domain/recipePredicates";
import { typedRecipesDb } from "./typedRecipesDb";
import { typedFoodDb } from "./typedFoodDb";
import { plannableDb } from "./plannableDb";
export const ZERO: Macronutrients = {
  kcal: 0,
  proteins: 0,
  lipids: 0,
  carbohydrates: 0,
  fibers: 0,
};
function add(a: Macronutrients, b: Macronutrients): Macronutrients {
  return {
    kcal: a.kcal + b.kcal,
    proteins: a.proteins + b.proteins,
    lipids: a.lipids + b.lipids,
    carbohydrates: a.carbohydrates + b.carbohydrates,
    fibers: a.fibers + b.fibers,
  };
}

function scale(m: Macronutrients, factor: number): Macronutrients {
  return {
    kcal: m.kcal * factor,
    proteins: m.proteins * factor,
    lipids: m.lipids * factor,
    carbohydrates: m.carbohydrates * factor,
    fibers: m.fibers * factor,
  };
}

function toGrams(
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
      const grams = toGrams(
        ingredient.quantity,
        ingredient.unit,
        food.unitWeight,
      );
      if (grams == null) continue;
      total = add(total, scale(food.macros, grams / 100));
    } else if (ingredient.baseId) {
      const base = allRecipes[ingredient.baseId];
      if (!base) continue;
      const baseMacrosPerPortion = calculateRecipeMacros(
        base,
        allRecipes,
        foodDb,
      );
      total = add(total, scale(baseMacrosPerPortion, ingredient.quantity));
    }
  }

  return scale(total, 1 / recipe.defaultPortions);
}

const _allRecipes = typedRecipesDb;
const _allFoods: Record<string, Food> = typedFoodDb;

export const RECIPE_MACROS: Record<string, Macronutrients> = Object.fromEntries(
  Object.entries(_allRecipes).flatMap(([id, recipe]) => {
    try {
      return [[id, calculateRecipeMacros(recipe, _allRecipes, _allFoods)]];
    } catch {
      return [];
    }
  })
);

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

export const RECIPE_BASE_GRAMS: Record<string, number> = Object.fromEntries(
  Object.entries(_allRecipes).flatMap(([id, recipe]) => {
    const grams = calculateRecipeBaseGrams(recipe, _allFoods);
    return grams > 0 ? [[id, grams]] : [];
  })
);

export function computeDayMacros(
  slots: MealSlot[],
  portionOverrides: Record<string, number>,
  gramOverrides: Record<string, number>,
): Macronutrients {
  return slots.reduce((total, slot) => {
    return getAllRecipeIds(slot).reduce((sum, id) => {
      const m = RECIPE_MACROS[id];
      if (!m) return sum;
      const key = `${slot.id}-${id}`;
      const portionMult = portionOverrides[key] ?? 1;
      const recipe = plannableDb[id];
      const recipeIsDish = isDish(recipe) || isBase(recipe);
      let factor: number;
      if (recipeIsDish) {
        factor = (slot.recipePersons?.[id] ?? 1) * portionMult;
      } else {
        const baseGrams = RECIPE_BASE_GRAMS[id];
        const journalGrams = gramOverrides[key];
        if (journalGrams !== undefined && baseGrams) {
          factor = journalGrams / baseGrams;
        } else {
          const recipeGrams = slot.recipeQuantities?.[id];
          const gramsFactor = recipeGrams !== undefined && baseGrams ? recipeGrams / baseGrams : 1;
          factor = portionMult * gramsFactor;
        }
      }
      return {
        kcal: sum.kcal + m.kcal * factor,
        proteins: sum.proteins + m.proteins * factor,
        lipids: sum.lipids + m.lipids * factor,
        carbohydrates: sum.carbohydrates + m.carbohydrates * factor,
        fibers: sum.fibers + m.fibers * factor,
      };
    }, total);
  }, { ...ZERO });
}
