import { Food, Macronutrients, RecipeDetails, Unit } from "../domain/types";
const ZERO: Macronutrients = {
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
