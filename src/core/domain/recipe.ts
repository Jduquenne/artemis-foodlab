import { Ingredient } from "./ingredient";
import { Macronutrients } from "./nutrition";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}

export enum RecipeKind {
  DISH = "dish",
  INGREDIENT = "ingredient",
  BASE = "base",
}

export type RecipeAssetKey = "photo" | "ingredientsPhoto" | "instructionsPhoto" | "mealPhoto" | "bookPhoto";

export interface RecipeAsset {
  url: string;
  key?: string;
}

export interface RecipeDetails {
  code: string;
  apiId: string;
  name: string;
  categoryId: string;
  mealTypes: MealType[];
  kind: RecipeKind;
  defaultPortions: number;
  ingredients: Ingredient[];
  instructions: string | null;
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
  batchCooking?: boolean;
  isDessert?: boolean;
  isFromBook?: boolean;
  bookPage?: number;
  announcedAt?: string | null;
}

export interface PlannableItem {
  code: string;
  apiId: string;
  name: string;
  categoryId: string;
  instructions: string | null;
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
  isFromBook?: boolean;
  bookPage?: number;
  kind?: RecipeKind;
  mealTypes?: MealType[];
  defaultPortions?: number;
  ingredients?: Ingredient[];
  batchCooking?: boolean;
  isDessert?: boolean;
  announcedAt?: string | null;
}

export interface OutdoorEntry {
  code: string;
  apiId: string;
  name: string;
  categoryId: string;
  instructions: string | null;
  isFromBook?: boolean;
  bookPage?: number;
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
}

export interface PredefinedFilter {
  id: string;
  label: string;
  check: (macros: Macronutrients) => boolean;
}
