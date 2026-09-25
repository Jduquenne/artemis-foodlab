import { IngredientCategory } from "./ingredient";
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
}

export interface BaseEntry {
  baseId: string;
  name: string;
  totalPortions: number;
  unit: string;
}

export interface ShoppingCatalogue {
  recipes: Record<string, RecipeDetails>;
  baseGrams: Record<string, number>;
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

export type IngredientGroup = { label: string; list: ConsolidatedIngredient[] };
