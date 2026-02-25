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

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: IngredientCategory;
}

export interface Macronutrients {
  KCAL: number;
  proteins: number;
  lipids: number;
  carbohydrate: number;
  fibers: number;
}

export interface RecipeDetails {
  name: string;
  macronutriment: Macronutrients;
  portion: number;
  ingredients: Ingredient[];
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
