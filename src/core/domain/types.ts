export enum Unit {
  KG = "kg",
  G = "g",
  L = "l",
  CL = "cl",
  ML = "ml",
  PIECE = "pièce",
  CAC = "c.à.café",
  CAS = "c.à.soupe",
}

export enum IngredientCategory {
  MEAT = "Viandes",
  VEGETABLE = "Légumes",
  FRUIT = "Fruits",
  DAIRY = "Produits frais",
  DRY = "Produits secs",
  CONDIMENT = "Condiments",
  BAKERY = "Boulangerie",
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  defaultUnit: Unit;
}

export interface RecipeIngredient {
  ingredientId: string; // Référence à l'Ingredient
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  categoryId: string;
  recipeId?: string;
  type?: "photo" | "ingredients" | "recipes";
  url?: string;
  image?: string;
  ingredientsImage?: string;
  instructionsImage?: string;
  ingredients: RecipeIngredient[];
  instructions?: string[];
}

export interface DailyMenu {
  lunchRecipeId?: string;
  dinnerRecipeId?: string;
}

export interface WeeklyMenu {
  weekId: string;
  days: Record<string, DailyMenu>;
}
