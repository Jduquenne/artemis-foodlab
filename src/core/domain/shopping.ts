import { PersonDefault } from "./personDefaults";
import { Accompaniment } from "./accompaniment";
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

interface ShoppingLineCommon {
  key: string;
  name: string;
  foodId?: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory | null;
  preparation?: string;
  sources: IngredientSource[];
}

export type ExtraAisle = { kind: "category" } | { kind: "custom"; customCategoryId: string } | { kind: "household" };

export type MealShoppingLine = ShoppingLineCommon & { origin: "meal"; toSpecify: boolean };

export type ExtraShoppingLine = ShoppingLineCommon & { origin: "extra"; extraId: string; aisle: ExtraAisle };

export type ConsolidatedIngredient = MealShoppingLine | ExtraShoppingLine;

export type ShoppingMode = "home" | "store";

export type ShoppingLayout = "aisles" | "meals";

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
  profiles: Pick<Profile, "id" | "name" | "foodGroupDefaults" | "accompanimentDefaults">[];
  accompaniments?: readonly Accompaniment[];
  personDefaults?: readonly PersonDefault[];
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
