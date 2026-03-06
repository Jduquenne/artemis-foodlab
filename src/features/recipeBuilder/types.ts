import { RecipeKind, Unit, IngredientCategory } from "../../core/domain/types";
import { CATEGORIES } from "../../core/domain/categories";

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

export interface DraftIngredient {
  id: string;
  ingredientType: "food" | "base";
  name: string;
  foodId?: string;
  baseId?: string;
  quantity: number | null;
  unit: Unit;
  preparation: string;
  category: IngredientCategory;
}

export interface RecipeBuilderState {
  recipeNumber: string;
  name: string;
  categoryId: string;
  kind: RecipeKind;
  mealTypes: "meal" | "side";
  defaultPortions: number;
  batchCooking: boolean;
  ingredients: DraftIngredient[];
}

export const initialRecipeBuilderState = (): RecipeBuilderState => ({
  recipeNumber: "",
  name: "",
  categoryId: CATEGORIES[0].id,
  kind: RecipeKind.DISH,
  mealTypes: "meal",
  defaultPortions: 4,
  batchCooking: false,
  ingredients: [],
});
