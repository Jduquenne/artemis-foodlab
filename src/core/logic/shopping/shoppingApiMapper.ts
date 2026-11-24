import { ExtraAisle, ExtraShoppingLine } from "../../domain/shopping";
import { getIngredientCategoryFromSlug } from "../../domain/ingredientCategorySlugs";

export interface ApiShoppingDay {
  id: string;
  year: number;
  week: number;
  day: string;
}

export interface ApiShoppingPeriod {
  id: string;
  days?: ApiShoppingDay[];
}

export interface ApiItemCheck {
  id: string;
  foodId: string | null;
  householdItemId: string | null;
  isChecked: boolean;
  stockOverride: number | null;
  stockByUnit: Record<string, number> | null;
  freezerBagIds: string[];
  stock: number;
  atPlace?: boolean;
}

export interface ApiSourceCheck {
  id: string;
  foodId: string;
  recipeId: string;
  day: string;
  slot: string;
  isChecked: boolean;
}

export interface ApiShoppingExtra {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  categoryId: string | null;
  customShoppingCategoryId: string | null;
  foodId: string | null;
  recipeId: string | null;
  isChecked: boolean;
  atPlace?: boolean;
  isHousehold: boolean;
  createdAt: string;
}

function extraAisle(extra: ApiShoppingExtra): ExtraAisle {
  if (extra.isHousehold) return { kind: "household" };
  return extra.customShoppingCategoryId ? { kind: "custom", customCategoryId: extra.customShoppingCategoryId } : { kind: "category" };
}

export function extrasToIngredients(extras: ApiShoppingExtra[]): ExtraShoppingLine[] {
  return extras.map((extra) => ({
    key: `extra::${extra.id}`,
    name: extra.name,
    ...(extra.foodId ? { foodId: extra.foodId } : {}),
    totalQuantity: extra.quantity ?? 0,
    unit: extra.unit ?? "",
    category: extra.categoryId ? (getIngredientCategoryFromSlug(extra.categoryId) ?? null) : null,
    sources: [],
    origin: "extra",
    extraId: extra.id,
    aisle: extraAisle(extra),
  }));
}
