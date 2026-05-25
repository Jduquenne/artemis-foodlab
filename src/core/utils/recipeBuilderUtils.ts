import {
  Food,
  IngredientCategory,
  Macronutrients,
  MealType,
  Preparation,
  RecipeDetails,
  Unit,
} from "../domain/types";
import {
  DraftIngredient,
  RecipeBuilderState,
} from "../domain/recipeBuilderTypes";
import { ZERO } from "./macroUtils";
import { calculateRecipeMacros } from "./macroUtils";
import { typedFoodDb } from "../typed-db/typedFoodDb";
import { typedRecipesDb } from "../typed-db/typedRecipesDb";

export const CATEGORY_PREFIX: Record<string, string> = {
  bases: "BASE",
  "cereal-products": "PC",
  "dairy-products": "PL",
  "dry-food": "AS",
  charcuterie: "CHAR",
  fish: "POI",
  fruits: "FR",
  pastries: "PAT",
  "plant-proteins": "PV",
  "red-meat": "VR",
  veggies: "VEG",
  "white-meat": "VB",
  outdoor: "OD",
};

export function buildRecipeId(
  categoryId: string,
  recipeNumber: string,
): string {
  const prefix = CATEGORY_PREFIX[categoryId] ?? categoryId.toUpperCase();
  if (!recipeNumber) return prefix;
  const num = parseInt(recipeNumber, 10);
  return `${prefix}_${isNaN(num) ? recipeNumber : String(num).padStart(2, "0")}`;
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
    case Unit.G:
      return qty;
    case Unit.KG:
      return qty * 1000;
    case Unit.ML:
      return qty;
    case Unit.PIECE:
    case Unit.PORTION:
    case Unit.TRANCHE:
    case Unit.FEUILLE:
    case Unit.SACHET:
      return unitWeight != null ? qty * unitWeight : null;
    default:
      return null;
  }
}

const foodDb: Record<string, Food> = typedFoodDb;

const INGREDIENT_LIST_CATEGORY_ORDER: IngredientCategory[][] = [
  [
    IngredientCategory.INTERNET,
    IngredientCategory.DELI,
    IngredientCategory.MEAT,
    IngredientCategory.FISH,
  ],
  [
    IngredientCategory.RECIPE,
    IngredientCategory.BAKERY,
    IngredientCategory.STARCH,
  ],
  [IngredientCategory.FRUIT_VEGETABLE, IngredientCategory.FROZEN],
  [IngredientCategory.DAIRY, IngredientCategory.FARM],
  [
    IngredientCategory.CANNED,
    IngredientCategory.DRIED_FRUIT,
    IngredientCategory.SWEET_GROCERY,
    IngredientCategory.SPICE_CONDIMENT,
    IngredientCategory.NON_PURCHASE,
    IngredientCategory.UNKNOWN,
  ],
];

function formatIngredientQty(quantity: number | null, unit: Unit): string {
  if (quantity == null) return "";
  if (unit === Unit.NONE) return ` - ${quantity}`;
  return ` - ${quantity}${formatUnitSuffix(quantity, unit)}`;
}

export function recipeToBuilderState(
  recipeId: string,
  recipe: RecipeDetails,
): RecipeBuilderState {
  const recipeNumber = recipeId.replace(/^[a-z]+-/, "");
  const mealTypes: "meal" | "side" = (recipe.mealTypes ?? []).some(
    (t: MealType) => t === MealType.LUNCH || t === MealType.DINNER,
  )
    ? "meal"
    : "side";
  const ingredients: DraftIngredient[] = recipe.ingredients.map((ing) => ({
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
    instructions: [],
  };
}

export interface IngredientLineItem {
  text: string;
  isNewCategory: boolean;
  baseLabel?: string;
}

const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.MEAT,
  IngredientCategory.FISH,
  IngredientCategory.DELI,
  IngredientCategory.STARCH,
  IngredientCategory.FRUIT_VEGETABLE,
  IngredientCategory.DRIED_FRUIT,
  IngredientCategory.DAIRY,
  IngredientCategory.FARM,
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.SPICE_CONDIMENT,
  IngredientCategory.BAKERY,
  IngredientCategory.RECIPE,
  IngredientCategory.NON_PURCHASE,
  IngredientCategory.FROZEN,
  IngredientCategory.INTERNET,
  IngredientCategory.UNKNOWN,
];

const EPICERIE_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.SPICE_CONDIMENT,
  IngredientCategory.BAKERY,
]);

const EPICERIE_COMMA_MAX_CHARS = 45;

const WORD_UNITS = new Set<Unit>([
  Unit.FEUILLE,
  Unit.PORTION,
  Unit.TRANCHE,
  Unit.SACHET,
]);

function formatUnitSuffix(quantity: number, unit: Unit): string {
  if (unit === Unit.NONE || unit === Unit.PIECE) return "";
  if (WORD_UNITS.has(unit)) return ` ${unit}${quantity > 1 ? "s" : ""}`;
  return unit;
}

function formatIngredientText(ing: DraftIngredient): string {
  const prep = ing.preparation ? ` (${ing.preparation})` : "";
  const name = `${ing.name}${prep}`;
  if (ing.quantity == null) return name;
  return `${name} - ${ing.quantity}${formatUnitSuffix(ing.quantity, ing.unit)}`;
}

function extractBaseLabel(baseId: string | undefined): string | undefined {
  if (!baseId) return undefined;
  const num = parseInt(baseId.replace(/^base-0*/, ""), 10);
  return Number.isNaN(num) ? undefined : `B${num}`;
}

function wrapCommaSeparated(items: string[], maxChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!current) {
      current = item;
    } else {
      const candidate = `${current}, ${item}`;
      if (candidate.length > maxChars) {
        lines.push(current);
        current = item;
      } else {
        current = candidate;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function formatIngredientsForIngredientCard(
  ingredients: DraftIngredient[],
): IngredientLineItem[] {
  const filtered = ingredients.filter((ing) => ing.name.trim());

  const groups = new Map<IngredientCategory, DraftIngredient[]>();
  for (const ing of filtered) {
    const arr = groups.get(ing.category) ?? [];
    arr.push(ing);
    groups.set(ing.category, arr);
  }

  const epicerieWithQty: DraftIngredient[] = [];
  const epicerieNoQty: string[] = [];
  for (const cat of EPICERIE_CATEGORIES) {
    for (const ing of groups.get(cat) ?? []) {
      if (ing.quantity != null) {
        epicerieWithQty.push(ing);
      } else {
        const prep = ing.preparation ? ` (${ing.preparation})` : "";
        epicerieNoQty.push(`${ing.name}${prep}`);
      }
    }
  }

  const result: IngredientLineItem[] = [];
  let epicerieAdded = false;

  const push = (text: string, isNewCat: boolean, baseLabel?: string) => {
    result.push({ text, isNewCategory: result.length > 0 && isNewCat, baseLabel });
  };

  for (const cat of INGREDIENT_CATEGORY_ORDER) {
    if (EPICERIE_CATEGORIES.has(cat)) {
      if (!epicerieAdded) {
        epicerieAdded = true;
        let firstInGroup = true;
        for (const ing of epicerieWithQty) {
          push(formatIngredientText(ing), firstInGroup, extractBaseLabel(ing.baseId));
          firstInGroup = false;
        }
        for (const line of wrapCommaSeparated(
          epicerieNoQty,
          EPICERIE_COMMA_MAX_CHARS,
        )) {
          push(line, firstInGroup);
          firstInGroup = false;
        }
      }
      continue;
    }

    const items = groups.get(cat);
    if (!items) continue;
    for (let i = 0; i < items.length; i++) {
      push(formatIngredientText(items[i]), i === 0, extractBaseLabel(items[i].baseId));
    }
  }

  return result;
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

export function generateIngredientListOutput(
  state: RecipeBuilderState,
): string {
  const groups = new Map<IngredientCategory, string[]>();
  for (const ing of state.ingredients) {
    const label = ing.preparation
      ? `${ing.name} (${ing.preparation})`
      : ing.name;
    const qty = formatIngredientQty(ing.quantity, ing.unit);
    const line = `${label}${qty}`;
    if (!groups.has(ing.category)) groups.set(ing.category, []);
    groups.get(ing.category)!.push(line);
  }
  return INGREDIENT_LIST_CATEGORY_ORDER.map((superGroup) =>
    superGroup
      .filter((cat) => groups.has(cat))
      .map((cat) => groups.get(cat)!.join("\n"))
      .join("\n"),
  )
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function computeDraftTotal(ingredients: DraftIngredient[]): {
  macros: Macronutrients;
  missing: number;
} {
  let total = { ...ZERO };
  let missing = 0;

  for (const ing of ingredients) {
    if (ing.quantity == null || ing.quantity === 0) continue;

    if (ing.foodId) {
      const food = foodDb[ing.foodId];
      if (!food) {
        missing++;
        continue;
      }
      const grams = toGrams(ing.quantity, ing.unit, food.unitWeight);
      if (grams == null) {
        missing++;
        continue;
      }
      total = addMacros(total, scaleMacros(food.macros, grams / 100));
    } else if (ing.baseId) {
      const base = typedRecipesDb[ing.baseId];
      if (!base) {
        missing++;
        continue;
      }
      const basePerPortion = calculateRecipeMacros(
        base,
        typedRecipesDb,
        foodDb,
      );
      total = addMacros(total, scaleMacros(basePerPortion, ing.quantity));
    } else {
      missing++;
    }
  }

  return { macros: total, missing };
}
