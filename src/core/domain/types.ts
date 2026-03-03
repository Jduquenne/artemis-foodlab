export enum Unit {
  NONE = "",
  C = "c",
  FEUILLE = "feuille",
  G = "g",
  KG = "kg",
  ML = "ml",
  PIECE = "pièce",
  PORTION = "portion",
  SACHET = "sachet",
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
  NON_PURCHASE = "Hors achat",
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
  name: string;
  quantity: number | null;
  unit: Unit;
  category: IngredientCategory;
  foodId?: string;
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

export interface RecipeAsset {
  url: string;
}

export interface RecipeDetails {
  name: string;
  categoryId: string;
  mealTypes: MealType[];
  kind: RecipeKind;
  macronutriment: Macronutrients;
  defaultPortions: number;
  ingredients: Ingredient[];
  assets: Partial<
    Record<"photo" | "ingredientsPhoto" | "instructionsPhoto", RecipeAsset>
  >;
  batchCooking?: boolean;
}

export interface ShoppingDay {
  year: number;
  week: number;
  day: string;
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

export interface FreezerBag {
  id: string;
  quantity: string;
  unit: Unit;
  preparation?: string;
  addedDate: string;
}

export interface FoodFreezerItem {
  id: string;
  type: "food";
  name: string;
  foodId?: string;
  bags: FreezerBag[];
}

export interface BatchFreezerItem {
  id: string;
  type: "batch";
  recipeId: string;
  recipeName: string;
  portions: number;
  addedDate: string;
}

export type FreezerItem = FoodFreezerItem | BatchFreezerItem;

export interface FreezerCategory {
  id: string;
  name: string;
  position: number;
  items: FreezerItem[];
}

export interface PredefinedFilter {
  id: string;
  label: string;
  check: (macros: Macronutrients) => boolean;
}

export interface MealSlot {
  id: string;
  day: string;
  slot: "breakfast" | "lunch" | "snack" | "dinner";
  recipeIds: string[];
  year: number;
  week: number;
  persons?: number;
}

export interface HouseholdRecord {
  id: string;
  lastCheckedAt: string;
}
