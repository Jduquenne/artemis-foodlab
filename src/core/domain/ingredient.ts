import { Macronutrients } from "./nutrition";

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

export const SELECTABLE_UNITS: Unit[] = Object.values(Unit).filter((u) => u !== Unit.NONE);

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

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: Unit;
  category: IngredientCategory;
  foodId?: string;
  baseId?: string;
  preparation?: string;
}

export interface Food {
  id: string;
  categoryId: string;
  name: string;
  category: IngredientCategory;
  macros: Macronutrients;
  unit: string | null;
  unitWeight: number | null;
  isFreezable?: boolean;
}
