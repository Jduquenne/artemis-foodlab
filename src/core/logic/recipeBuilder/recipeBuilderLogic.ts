import {
  Food,
  Ingredient,
  IngredientCategory,
  Macronutrients,
  MealType,
  Preparation,
  RecipeDetails,
  RecipeKind,
  Unit,
} from "../../domain/types";
import {
  DraftIngredient,
  RecipeBuilderState,
} from "../../domain/recipeBuilderTypes";
import { ZERO, calculateRecipeMacros, addMacros, scaleMacros, toGrams } from "../../../shared/utils/macroUtils";
import { IngredientLineItem } from "../../domain/cardTypes";
import { wrapLineAtMaxChars } from "../../../shared/utils/cards/cardUtils";
import { typedFoodDb } from "../../typed-db/typedFoodDb";
import { typedRecipesDb } from "../../typed-db/typedRecipesDb";
import { typedInstructionsDb } from "../../typed-db/typedInstructionsDb";

export const BUILDER_UNITS: Unit[] = Object.values(Unit).filter((u) => u !== Unit.NONE);

export function switchIngredientType(
  ing: DraftIngredient,
  type: "food" | "base",
): DraftIngredient {
  return {
    ...ing,
    ingredientType: type,
    name: "",
    foodId: undefined,
    baseId: undefined,
    quantity: null,
    unit: type === "base" ? Unit.PORTION : Unit.NONE,
    preparation: "",
    category: type === "base" ? IngredientCategory.RECIPE : IngredientCategory.FRUIT_VEGETABLE,
  };
}

export function searchFoods(query: string, foods: Food[]): Food[] {
  const q = query.toLowerCase();
  const startsWith = foods.filter((f) => f.name.toLowerCase().startsWith(q));
  const contains = foods.filter(
    (f) => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q),
  );
  return [...startsWith, ...contains].slice(0, 8);
}

export function searchBases(
  query: string,
  bases: { id: string; name: string }[],
): { id: string; name: string }[] {
  if (!query) return bases.slice(0, 8);
  const q = query.toLowerCase();
  const startsWith = bases.filter((r) => r.name.toLowerCase().startsWith(q));
  const contains = bases.filter(
    (r) => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q),
  );
  return [...startsWith, ...contains].slice(0, 8);
}

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
  "sweet-grocery": "ES",
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

export function buildRecipeDbId(
  categoryId: string,
  recipeNumber: string,
): string {
  const prefix = (CATEGORY_PREFIX[categoryId] ?? categoryId).toLowerCase();
  if (!recipeNumber) return prefix;
  const num = parseInt(recipeNumber, 10);
  return `${prefix}-${isNaN(num) ? recipeNumber : String(num).padStart(3, "0")}`;
}

export function buildImageName(
  categoryId: string,
  recipeNumber: string,
  recipeName: string,
  type?: string,
): string {
  const id = buildRecipeId(categoryId, recipeNumber);
  const namePart = recipeName.trim().replace(/ /g, "_");
  return type ? `${id}_${namePart}_${type}` : `${id}_${namePart}`;
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
    IngredientCategory.CONDIMENT,
    IngredientCategory.SPICE,
    IngredientCategory.AROMATIC_HERB,
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
    category: (ing.category as IngredientCategory) ?? IngredientCategory.UNKNOWN,
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
    fromBook: false,
    ingredients,
    instructions: typedInstructionsDb[recipeId]?.instructions.split("\n") ?? [],
  };
}

export function builderStateToRecipe(state: RecipeBuilderState): RecipeDetails & { id: string } {
  const id = buildRecipeDbId(state.categoryId, state.recipeNumber);
  const existing = typedRecipesDb[id];
  const isBaseKind = state.kind === RecipeKind.BASE;
  const mealTypes: MealType[] = isBaseKind
    ? []
    : state.mealTypes === "meal"
      ? [MealType.LUNCH, MealType.DINNER]
      : [MealType.BREAKFAST, MealType.SNACK];
  const ingredients: Ingredient[] = state.ingredients
    .filter((ing) => ing.name.trim())
    .map((ing) => ({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      category: ing.category,
      foodId: ing.foodId,
      baseId: ing.baseId,
      preparation: ing.preparation || undefined,
    }));

  return {
    id,
    name: state.name,
    categoryId: state.categoryId,
    mealTypes,
    kind: state.kind,
    macronutriment: existing?.macronutriment ?? ZERO,
    defaultPortions: state.defaultPortions,
    ingredients,
    assets: existing?.assets ?? {},
    batchCooking: state.batchCooking || undefined,
    isDessert: isBaseKind ? undefined : state.isDessert || undefined,
    bookPage: existing?.bookPage,
  };
}

const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.RECIPE,
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
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
  IngredientCategory.BAKERY,
  IngredientCategory.NON_PURCHASE,
  IngredientCategory.FROZEN,
  IngredientCategory.INTERNET,
  IngredientCategory.UNKNOWN,
];

const EPICERIE_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.BAKERY,
]);

const COMMA_JOIN_CATEGORIES = new Set<IngredientCategory>([
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
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

function wrapJoined(items: string[], maxChars: number, sep: string): string[] {
  const lines: string[] = [];
  let current = "";
  for (const item of items) {
    if (!current) {
      current = item;
    } else {
      const candidate = `${current}${sep}${item}`;
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

function wrapCommaSeparated(items: string[], maxChars: number): string[] {
  return wrapJoined(items, maxChars, ", ");
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
          const wrapped = wrapLineAtMaxChars(formatIngredientText(ing), EPICERIE_COMMA_MAX_CHARS);
          for (let li = 0; li < wrapped.length; li++) {
            push(wrapped[li], firstInGroup && li === 0, li === 0 ? extractBaseLabel(ing.baseId) : undefined);
          }
          firstInGroup = false;
        }
        for (const line of wrapCommaSeparated(epicerieNoQty, EPICERIE_COMMA_MAX_CHARS)) {
          push(line, firstInGroup);
          firstInGroup = false;
        }
      }
      continue;
    }

    const items = groups.get(cat);
    if (!items) continue;

    if (COMMA_JOIN_CATEGORIES.has(cat)) {
      let firstInGroup = true;
      const withQty = items.filter(i => i.quantity != null);
      const noQty = items
        .filter(i => i.quantity == null)
        .map(i => {
          const prep = i.preparation ? ` (${i.preparation})` : "";
          return `${i.name}${prep}`;
        });
      for (const ing of withQty) {
        const wrapped = wrapLineAtMaxChars(formatIngredientText(ing), EPICERIE_COMMA_MAX_CHARS);
        for (let li = 0; li < wrapped.length; li++) {
          push(wrapped[li], firstInGroup && li === 0, li === 0 ? extractBaseLabel(ing.baseId) : undefined);
        }
        firstInGroup = false;
      }
      for (const line of wrapJoined(noQty, EPICERIE_COMMA_MAX_CHARS, " - ")) {
        push(line, firstInGroup);
        firstInGroup = false;
      }
      continue;
    }

    for (let i = 0; i < items.length; i++) {
      const wrapped = wrapLineAtMaxChars(formatIngredientText(items[i]), EPICERIE_COMMA_MAX_CHARS);
      for (let li = 0; li < wrapped.length; li++) {
        push(wrapped[li], i === 0 && li === 0, li === 0 ? extractBaseLabel(items[i].baseId) : undefined);
      }
    }
  }

  return result;
}

export function generateCsvOutput(state: RecipeBuilderState): string {
  const isBase = state.kind === RecipeKind.BASE;
  const cells: string[] = [
    buildRecipeId(state.categoryId, state.recipeNumber),
    state.name,
    String(state.defaultPortions),
    ...(isBase ? [] : [state.mealTypes]),
    state.kind,
    ...(isBase ? [] : [state.isDessert ? "TRUE" : "FALSE"]),
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
      const basePerPortion = calculateRecipeMacros(base, typedRecipesDb, foodDb);
      total = addMacros(total, scaleMacros(basePerPortion, ing.quantity));
    } else {
      missing++;
    }
  }

  return { macros: total, missing };
}
