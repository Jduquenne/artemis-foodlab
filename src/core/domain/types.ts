export enum Unit {
  NONE = "",
  C = "c",
  CC = "cc",
  CL = "cl",
  FEUILLE = "feuille",
  G = "g",
  KG = "kg",
  L = "l",
  LOUCHE = "louche",
  ML = "ml",
  MOYENNE = "moyenne",
  PART = "part",
  PETITE = "petite",
  PORTION = "portion",
  SACHET = "sachet",
  TIERS = "tiers",
  TRANCHE = "tranche",
}

export enum IngredientCategory {
  FRUIT_VEGETABLE = "Fruits et légumes",
  DRIED_FRUIT = "Fruits secs",
  MEAT = "Viande",
  SPICE_CONDIMENT = "Epices et condiments",
  SWEET_GROCERY = "Epicerie sucrée",
  BAKERY = "Boulangerie",
  RECIPE = "Recette",
  DAIRY = "Produits laitiers",
  FARM = "Ferme",
  STARCH = "Féculents",
  DELI = "Charcuterie",
  CANNED = "Conserves",
  FISH = "Poisson",
  NON_PURCHASE = "Hors achats",
  FROZEN = "Surgelés",
  INTERNET = "Internet",
  UNKNOWN = "Inconnu", // Pratique pour votre script de debug !
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
}

export interface Food {
  id: string;
  name: string;
  category: IngredientCategory;
}

export interface Ingredient {
  id: string;
  foodId?: string;
  name: string;
  quantity: string;
  unit: Unit;
  category: IngredientCategory;
  preparation?: string;
}

export interface Macronutrients {
  KCAL: number;
  proteins: number;
  lipids: number;
  carbohydrate: number;
  fibers: number;
}

export enum MealType {
  MEAL = "meal",
  SIDE = "side",
}

export enum RecipeKind {
  dish = "dish",
  INGREDIENT = "ingredient",
  BASE = "base",
}

export interface RecipeAsset {
  url: string;
}

export interface RecipeDetails {
  name: string;
  categoryId: string;
  mealType: MealType[];
  kind: RecipeKind;
  macronutriment: Macronutrients;
  portion: number;
  ingredients: Ingredient[];
  assets: Partial<Record<"photo" | "ingredients" | "recipes", RecipeAsset>>;
}

export interface ShoppingDay {
  year: number;
  week: number;
  day: string;
}

export interface PredefinedFilter {
  id: string;
  label: string;
  check: (macros: Macronutrients) => boolean;
}
