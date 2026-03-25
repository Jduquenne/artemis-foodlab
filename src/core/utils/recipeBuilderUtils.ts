import { Food, IngredientCategory, Macronutrients, MealType, Preparation, RecipeDetails, Unit } from "../domain/types";
import { DraftIngredient, RecipeBuilderState } from "../domain/recipeBuilderTypes";
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

const INGREDIENT_LIST_CATEGORY_ORDER: IngredientCategory[][] = [
  [IngredientCategory.INTERNET, IngredientCategory.DELI, IngredientCategory.MEAT, IngredientCategory.FISH],
  [IngredientCategory.RECIPE, IngredientCategory.BAKERY, IngredientCategory.STARCH],
  [IngredientCategory.FRUIT_VEGETABLE, IngredientCategory.FROZEN],
  [IngredientCategory.DAIRY, IngredientCategory.FARM],
  [IngredientCategory.CANNED, IngredientCategory.DRIED_FRUIT, IngredientCategory.SWEET_GROCERY, IngredientCategory.SPICE_CONDIMENT, IngredientCategory.NON_PURCHASE, IngredientCategory.UNKNOWN],
];

function formatIngredientQty(quantity: number | null, unit: Unit): string {
  if (quantity == null) return "";
  if (unit === Unit.PORTION) {
    return ` - ${quantity} ${quantity <= 1 ? "portion" : "portions"}`;
  }
  if (unit === Unit.NONE) return ` - ${quantity}`;
  return ` - ${quantity}${unit}`;
}

export function recipeToBuilderState(recipeId: string, recipe: RecipeDetails): RecipeBuilderState {
  const recipeNumber = recipeId.replace(/^[a-z]+-/, "");
  const mealTypes: "meal" | "side" = (recipe.mealTypes ?? []).some(
    (t: MealType) => t === MealType.LUNCH || t === MealType.DINNER
  ) ? "meal" : "side";
  const ingredients: DraftIngredient[] = recipe.ingredients.map(ing => ({
    id: crypto.randomUUID(),
    ingredientType: ing.baseId ? "base" : "food",
    name: ing.name,
    foodId: ing.foodId,
    baseId: ing.baseId,
    quantity: ing.quantity,
    unit: ing.unit as Unit,
    preparation: (ing.preparation ?? "") as Preparation | "",
    category: ing.category as IngredientCategory,
  }));
  return {
    recipeNumber,
    name: recipe.name,
    categoryId: recipe.categoryId,
    kind: recipe.kind,
    mealTypes,
    defaultPortions: recipe.defaultPortions,
    isDessert: recipe.isDessert ?? false,
    batchCooking: recipe.batchCooking ?? false,
    ingredients,
  };
}

export function generateCsvOutput(state: RecipeBuilderState): string {
  const cells: string[] = [
    buildRecipeId(state.categoryId, state.recipeNumber),
    state.name,
    String(state.defaultPortions),
    state.mealTypes,
    state.kind,
    state.isDessert ? "TRUE" : "FALSE",
    state.batchCooking ? "TRUE" : "FALSE",
  ];
  for (const ing of state.ingredients) {
    cells.push(ing.name);
    cells.push(ing.preparation ?? "");
    const qtyUnit =
      ing.quantity != null
        ? `${ing.quantity}${ing.unit && ing.unit !== Unit.G ? " " + ing.unit : ""}`.trim()
        : "";
    cells.push(qtyUnit);
  }
  return cells.join("\t");
}

export function generateIngredientListOutput(state: RecipeBuilderState): string {
  const groups = new Map<IngredientCategory, string[]>();
  for (const ing of state.ingredients) {
    const label = ing.preparation ? `${ing.name} (${ing.preparation})` : ing.name;
    const qty = formatIngredientQty(ing.quantity, ing.unit);
    const line = `${label}${qty}`;
    if (!groups.has(ing.category)) groups.set(ing.category, []);
    groups.get(ing.category)!.push(line);
  }
  return INGREDIENT_LIST_CATEGORY_ORDER
    .map(superGroup =>
      superGroup
        .filter(cat => groups.has(cat))
        .map(cat => groups.get(cat)!.join("\n"))
        .join("\n")
    )
    .filter(block => block.length > 0)
    .join("\n\n");
}

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
