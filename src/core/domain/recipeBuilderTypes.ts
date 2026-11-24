import { Unit, IngredientCategory } from "./ingredient";
import { RecipeKind, MealType } from "./recipe";

export interface IndustrialEquivalentDraft {
  foodId: string | null;
  quantity: number | null;
  unit: Unit;
}

export interface DraftIngredientCommon {
  id: string;
  apiId?: string;
  name: string;
  quantity: number | null;
  unit: Unit;
  preparation: string;
  category: IngredientCategory;
}

export type DraftIngredient = DraftIngredientCommon & (
  | { ingredientType: "food"; foodId: string | null; foodGroupId: string | null }
  | { ingredientType: "base"; baseId: string | null }
);

export interface RecipeBuilderState {
  sourceCode: string | null;
  recipeNumber: string;
  name: string;
  categoryId: string;
  kind: RecipeKind;
  mealTypes: MealType[];
  defaultPortions: number;
  portionsPerPerson: number | null;
  cookedWeightGrams: number | null;
  isDessert: boolean;
  batchCooking: boolean;
  isFromBook: boolean;
  bookPage: number | null;
  ingredients: DraftIngredient[];
  instructions: string[];
  industrialEquivalent: IndustrialEquivalentDraft | null;
}
