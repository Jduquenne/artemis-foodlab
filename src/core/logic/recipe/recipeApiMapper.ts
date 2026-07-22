import {
  Ingredient,
  IngredientCategory,
  MealType,
  OutdoorEntry,
  Preparation,
  RecipeAsset,
  RecipeAssetKey,
  RecipeDetails,
  RecipeKind,
  Unit,
} from "../../domain/types";
import { ZERO } from "../../../shared/utils/macroUtils";

export interface ApiIngredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  categoryId: string;
  category: string;
  foodId: string | null;
  baseId: string | null;
  preparation: string | null;
}

export interface ApiRecipe {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  kind: string;
  mealTypes: string[];
  defaultPortions: number;
  batchCooking: boolean;
  isDessert: boolean;
  isFromBook: boolean;
  bookPage: number | null;
  instructions: string | null;
  ingredients: ApiIngredient[];
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
}

export interface ApiOutdoorActivity {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  isFromBook: boolean;
  bookPage: number | null;
  instructions: string | null;
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
}

export function buildCodeByApiId(recipes: ApiRecipe[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of recipes) map.set(r.id, r.code);
  return map;
}

function mapApiIngredient(ing: ApiIngredient, codeByApiId: Map<string, string>): Ingredient {
  return {
    id: ing.id,
    name: ing.name,
    quantity: ing.quantity,
    unit: (ing.unit ?? Unit.NONE) as Unit,
    category: ing.category as IngredientCategory,
    foodId: ing.foodId ?? undefined,
    baseId: ing.baseId ? (codeByApiId.get(ing.baseId) ?? ing.baseId) : undefined,
    preparation: (ing.preparation ?? undefined) as Preparation | undefined,
  };
}

export function mapApiRecipe(api: ApiRecipe, codeByApiId: Map<string, string>): RecipeDetails {
  return {
    code: api.code,
    apiId: api.id,
    name: api.name,
    categoryId: api.categoryId,
    mealTypes: api.mealTypes as MealType[],
    kind: api.kind as RecipeKind,
    macronutriment: ZERO,
    defaultPortions: api.defaultPortions,
    ingredients: api.ingredients.map((ing) => mapApiIngredient(ing, codeByApiId)),
    instructions: api.instructions,
    assets: api.assets,
    batchCooking: api.batchCooking || undefined,
    isDessert: api.isDessert || undefined,
    isFromBook: api.isFromBook || undefined,
    bookPage: api.bookPage ?? undefined,
  };
}

export function mapApiRecipes(recipes: ApiRecipe[]): Record<string, RecipeDetails> {
  const codeByApiId = buildCodeByApiId(recipes);
  const result: Record<string, RecipeDetails> = {};
  for (const r of recipes) result[r.code] = mapApiRecipe(r, codeByApiId);
  return result;
}

function mapApiOutdoorActivity(api: ApiOutdoorActivity): OutdoorEntry {
  return {
    code: api.code,
    apiId: api.id,
    name: api.name,
    categoryId: api.categoryId,
    instructions: api.instructions,
    isFromBook: api.isFromBook || undefined,
    bookPage: api.bookPage ?? undefined,
    assets: api.assets,
  };
}

export function mapApiOutdoorActivities(activities: ApiOutdoorActivity[]): Record<string, OutdoorEntry> {
  const result: Record<string, OutdoorEntry> = {};
  for (const a of activities) result[a.code] = mapApiOutdoorActivity(a);
  return result;
}
