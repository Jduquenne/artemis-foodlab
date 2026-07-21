import { normalizeName } from "./nameNormalize";
import { formatQuantityText, parseQuantityText } from "./quantity";
import { field, SheetRow } from "./sheetRecords";
import { Ingredient, IngredientCategory, MealType, Preparation, RecipeDetails, RecipeKind } from "../types";

const MAX_INGREDIENT_SLOTS = 30;

export interface RawIngredientRef {
  name: string;
  preparation: string;
  quantityText: string;
}

export interface RawRecipeRow {
  id: string;
  name: string;
  defaultPortions: number;
  mealTypes: MealType[];
  kind: RecipeKind;
  isDessert?: boolean;
  batchCooking?: boolean;
  rawIngredients: RawIngredientRef[];
}

function toBool(text: string): boolean {
  return text.trim().toUpperCase() === "TRUE";
}

function parseMealTypes(raw: string): MealType[] {
  const value = raw.trim().toLowerCase();
  if (value === "meal") return [MealType.LUNCH, MealType.DINNER];
  if (value === "side") return [MealType.BREAKFAST, MealType.SNACK];
  return [];
}

function formatMealTypes(mealTypes: MealType[]): string {
  const isMeal = mealTypes.includes(MealType.LUNCH) || mealTypes.includes(MealType.DINNER);
  return isMeal ? "meal" : "side";
}

export function parseRawRecipeRow(sheetRow: SheetRow): RawRecipeRow | null {
  const { record } = sheetRow;
  const id = field(record, "id");
  if (!id) return null;

  const rawIngredients: RawIngredientRef[] = [];
  for (let i = 1; i <= MAX_INGREDIENT_SLOTS; i++) {
    const name = field(record, `ingredient ${i}`);
    if (!name) continue;
    rawIngredients.push({
      name,
      preparation: field(record, `preparation ${i}`),
      quantityText: field(record, `quantity ${i}`),
    });
  }

  const isDessertRaw = field(record, "isDessert");
  const batchCookingRaw = field(record, "isBatchCooking");

  return {
    id,
    name: field(record, "name"),
    defaultPortions: Number(field(record, "defaultPortions")) || 1,
    mealTypes: parseMealTypes(field(record, "type")),
    kind: (field(record, "kind") || "dish") as RecipeKind,
    isDessert: isDessertRaw ? toBool(isDessertRaw) : undefined,
    batchCooking: batchCookingRaw ? toBool(batchCookingRaw) : undefined,
    rawIngredients,
  };
}

export interface FoodIndexEntry {
  id: string;
  category: IngredientCategory;
}

export interface RecipeNameIndexEntry {
  id: string;
}

export function resolveIngredient(
  ref: RawIngredientRef,
  ingredientId: string,
  foodIndex: Map<string, FoodIndexEntry>,
  recipeNameIndex: Map<string, RecipeNameIndexEntry>,
): Ingredient {
  const { quantity, unit } = parseQuantityText(ref.quantityText);
  const normalized = normalizeName(ref.name);
  const food = foodIndex.get(normalized);
  const recipe = !food ? recipeNameIndex.get(normalized) : undefined;

  return {
    id: ingredientId,
    name: ref.name,
    quantity,
    unit,
    category: food ? food.category : recipe ? IngredientCategory.RECIPE : IngredientCategory.UNKNOWN,
    foodId: food?.id,
    baseId: recipe?.id,
    preparation: ref.preparation ? (ref.preparation as Preparation) : undefined,
  };
}

export function buildRecipeRowValues(recipe: RecipeDetails): Record<string, unknown> {
  const values: Record<string, unknown> = {
    id: recipe.id,
    name: recipe.name,
    defaultportions: recipe.defaultPortions,
    type: formatMealTypes(recipe.mealTypes),
    kind: recipe.kind,
    isdessert: recipe.isDessert ? "TRUE" : "FALSE",
    isbatchcooking: recipe.batchCooking ? "TRUE" : "FALSE",
  };

  recipe.ingredients.forEach((ing, i) => {
    const n = i + 1;
    values[`ingredient ${n}`] = ing.name;
    values[`preparation ${n}`] = ing.preparation ?? "";
    values[`quantity ${n}`] = formatQuantityText(ing.quantity, ing.unit);
  });

  return values;
}
