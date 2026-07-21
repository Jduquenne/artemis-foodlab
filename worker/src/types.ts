export enum Unit {
  NONE = "",
  FEUILLE = "feuille",
  G = "g",
  KG = "kg",
  ML = "ml",
  PIECE = "pièce",
  PORTION = "portion",
  SACHET = "sachet",
  TRANCHE = "tranche",
}

export enum Preparation {
  DICED = "dés",
  ESCALOPE = "escalope",
  ROUNDS = "rondelles",
  SLICES = "lamelles",
  BRUNOISE = "brunoise",
  LARGE_DICED = "gros dés",
  GRATED = "râpé",
  HALF = "demie",
  HALF_ROUNDS = "demi-rondelles",
  STICKS = "bâtonnets",
  WHOLE = "entier",
  LING = "julienne",
}

export enum IngredientCategory {
  FRUIT_VEGETABLE = "Fruits et légumes",
  DRIED_FRUIT = "Fruits secs",
  MEAT = "Viande",
  CONDIMENT = "Condiments",
  SPICE = "Epices",
  AROMATIC_HERB = "Herbe aromatique",
  SWEET_GROCERY = "Epicerie sucrée",
  BAKERY = "Boulangerie",
  RECIPE = "Recette",
  DAIRY = "Produits laitiers",
  FARM = "Ferme",
  STARCH = "Féculents",
  DELI = "Charcuterie",
  CANNED = "Conserves",
  FISH = "Poisson",
  NON_PURCHASE = "Hors achat",
  FROZEN = "Surgelés",
  INTERNET = "Internet",
  UNKNOWN = "Inconnu",
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
}

export interface Macronutrients {
  kcal: number;
  proteins: number;
  lipids: number;
  carbohydrates: number;
  fibers: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: Unit;
  category: IngredientCategory;
  foodId?: string;
  baseId?: string;
  preparation?: Preparation;
}

export interface RecipeDetails {
  id: string;
  name: string;
  categoryId: string;
  mealTypes: MealType[];
  kind: RecipeKind;
  defaultPortions: number;
  ingredients: Ingredient[];
  assets: Partial<Record<RecipeAssetKey, RecipeAsset>>;
  batchCooking?: boolean;
  isDessert?: boolean;
  bookPage?: number;
}

export interface Food {
  id: string;
  name: string;
  category: IngredientCategory;
  macros: Macronutrients;
  unit?: string;
  unitWeight?: number;
  isFreezable?: boolean;
}

export enum HouseholdCategory {
  HYGIENE = "Hygiène",
  MAINTENANCE = "Entretien",
  PHARMACY = "Pharmacie",
  PANTRY = "Garde manger",
  PETS = "Animaux",
}

export interface HouseholdItem {
  id: string;
  name: string;
  category: HouseholdCategory;
}

export interface InstructionEntry {
  id: string;
  fromBook: boolean;
  bookPage?: number;
  instructions: string;
}

export interface Env {
  ALLOWED_ORIGINS: string;
  RECETTES_SHEET_NAME: string;
  BASES_SHEET_NAME: string;
  INGREDIENTS_SHEET_NAME: string;
  INSTRUCTIONS_SHEET_NAME: string;
  ALIMENTS_SHEET_NAME: string;
  HOUSEHOLD_SHEET_NAME: string;
  PHOTOS_SHEET_NAME: string;
  READ_CACHE_TTL_SECONDS: string;
  GOOGLE_CLIENT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
  ADMIN_TOKEN: string;
}
