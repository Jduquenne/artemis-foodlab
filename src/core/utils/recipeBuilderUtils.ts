import { Food, Macronutrients, Unit } from "../domain/types";
import { DraftIngredient } from "../domain/recipeBuilderTypes";
import { ZERO } from "./macroUtils";
import { calculateRecipeMacros } from "./macroUtils";
import { typedFoodDb } from "../typed-db/typedFoodDb";
import { typedRecipesDb } from "../typed-db/typedRecipesDb";

export const CATEGORY_PREFIX: Record<string, string> = {
  "bases": "BASE",
  "cereal-products": "PC",
  "dairy-products": "PL",
  "dry-food": "AS",
  "charcuterie": "CHAR",
  "fish": "POI",
  "fruits": "FR",
  "pastries": "PAT",
  "plant-proteins": "PV",
  "red-meat": "VR",
  "veggies": "VEG",
  "white-meat": "VB",
  "outdoor": "OD",
};

export function buildRecipeId(categoryId: string, recipeNumber: string): string {
  const prefix = CATEGORY_PREFIX[categoryId] ?? categoryId.toUpperCase();
  return recipeNumber ? `${prefix}_${recipeNumber}` : prefix;
}

function addMacros(a: Macronutrients, b: Macronutrients): Macronutrients {
  return {
    kcal: a.kcal + b.kcal,
    proteins: a.proteins + b.proteins,
    lipids: a.lipids + b.lipids,
    carbohydrates: a.carbohydrates + b.carbohydrates,
    fibers: a.fibers + b.fibers,
  };
}

function scaleMacros(m: Macronutrients, factor: number): Macronutrients {
  return {
    kcal: m.kcal * factor,
    proteins: m.proteins * factor,
    lipids: m.lipids * factor,
    carbohydrates: m.carbohydrates * factor,
    fibers: m.fibers * factor,
  };
}

function toGrams(qty: number, unit: Unit, unitWeight?: number): number | null {
  switch (unit) {
    case Unit.G: return qty;
    case Unit.KG: return qty * 1000;
    case Unit.ML: return qty;
    case Unit.PIECE:
    case Unit.PORTION:
    case Unit.TRANCHE:
    case Unit.FEUILLE:
    case Unit.SACHET:
      return unitWeight != null ? qty * unitWeight : null;
    default: return null;
  }
}

const foodDb: Record<string, Food> = typedFoodDb;

export function computeDraftTotal(ingredients: DraftIngredient[]): { macros: Macronutrients; missing: number } {
  let total = { ...ZERO };
  let missing = 0;

  for (const ing of ingredients) {
    if (ing.quantity == null || ing.quantity === 0) continue;

    if (ing.foodId) {
      const food = foodDb[ing.foodId];
      if (!food) { missing++; continue; }
      const grams = toGrams(ing.quantity, ing.unit, food.unitWeight);
      if (grams == null) { missing++; continue; }
      total = addMacros(total, scaleMacros(food.macros, grams / 100));
    } else if (ing.baseId) {
      const base = typedRecipesDb[ing.baseId];
      if (!base) { missing++; continue; }
      const basePerPortion = calculateRecipeMacros(base, typedRecipesDb, foodDb);
      total = addMacros(total, scaleMacros(basePerPortion, ing.quantity));
    } else {
      missing++;
    }
  }

  return { macros: total, missing };
}
