import { Food, IngredientCategory } from "./ingredient";
import { Profile } from "./profile";
import { RecipeDetails } from "./recipe";

export interface IngredientSource {
  recipeId: string;
  recipeName: string;
  day: string;
  isoDate: string;
  slot: string;
  quantity: number;
  unit: string;
  persons?: number;
  baseQuantity?: number;
  fromBaseId?: string;
  profileNames?: string[];
}

export interface ConsolidatedIngredient {
  key: string;
  name: string;
  foodId?: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory | undefined;
  preparation?: string;
  sources: IngredientSource[];
  isExtra?: boolean;
  extraId?: string;
  toSpecify?: boolean;
  customCategoryId?: string;
}

export const MAX_CUSTOM_SHOPPING_CATEGORIES = 30;

export interface CustomShoppingCategory {
  id: string;
  label: string;
}

export type ShoppingAisle =
  | { kind: "shared"; id: string; category: IngredientCategory; label: string }
  | { kind: "custom"; id: string; label: string };

export interface BaseEntry {
  baseId: string;
  name: string;
  totalPortions: number;
  unit: string;
}

export interface ShoppingCatalogue {
  recipes: Record<string, RecipeDetails>;
  baseGrams: Record<string, number>;
  foods: Record<string, Food>;
  profiles: Pick<Profile, "id" | "name" | "foodGroupDefaults">[];
}

export interface RecipeCardIngredient {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  sources: IngredientSource[];
}

export interface RecipeBaseGroup {
  baseId: string;
  baseName: string;
  ingredients: RecipeCardIngredient[];
}

export interface RecipeCard {
  recipeId: string;
  recipeName: string;
  directIngredients: RecipeCardIngredient[];
  baseGroups: RecipeBaseGroup[];
}

export type IngredientGroup = { key: string; label: string; list: ConsolidatedIngredient[] };
