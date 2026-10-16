import { IngredientCategory } from "../../domain/ingredient";
import { getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";
import { CustomShoppingCategory, ShoppingAisle } from "../../domain/shopping";

export const DEFAULT_SHOPPING_CATEGORY_ORDER: readonly IngredientCategory[] = [
  IngredientCategory.FRUIT_VEGETABLE,
  IngredientCategory.MEAT,
  IngredientCategory.FISH,
  IngredientCategory.DELI,
  IngredientCategory.DAIRY,
  IngredientCategory.FARM,
  IngredientCategory.BAKERY,
  IngredientCategory.STARCH,
  IngredientCategory.CANNED,
  IngredientCategory.SWEET_GROCERY,
  IngredientCategory.DRIED_FRUIT,
  IngredientCategory.CONDIMENT,
  IngredientCategory.SPICE,
  IngredientCategory.AROMATIC_HERB,
  IngredientCategory.FROZEN,
  IngredientCategory.RECIPE,
  IngredientCategory.INTERNET,
  IngredientCategory.NON_PURCHASE,
];

function sharedAisle(category: IngredientCategory): ShoppingAisle | null {
  const slug = getIngredientCategoryId(category);
  return slug ? { kind: "shared", id: slug, category, label: category } : null;
}

function customAisle(category: CustomShoppingCategory): ShoppingAisle {
  return { kind: "custom", id: category.id, label: category.label };
}

export function defaultShoppingAisles(customCategories: readonly CustomShoppingCategory[]): ShoppingAisle[] {
  const shared = DEFAULT_SHOPPING_CATEGORY_ORDER.map(sharedAisle).filter((a): a is ShoppingAisle => a !== null);
  return [...shared, ...customCategories.map(customAisle)];
}

export function resolveShoppingAisles(
  saved: readonly string[] | null | undefined,
  customCategories: readonly CustomShoppingCategory[],
): ShoppingAisle[] {
  if (!saved) return defaultShoppingAisles(customCategories);
  const known = new Map<string, ShoppingAisle>(defaultShoppingAisles(customCategories).map((a) => [a.id, a]));
  const result: ShoppingAisle[] = [];
  const has = (id: string) => result.some((a) => a.id === id);
  for (const id of saved) {
    const aisle = known.get(id);
    if (aisle && !has(aisle.id)) result.push(aisle);
  }
  DEFAULT_SHOPPING_CATEGORY_ORDER.forEach((category, index) => {
    const aisle = sharedAisle(category);
    if (!aisle || has(aisle.id)) return;
    const previous = DEFAULT_SHOPPING_CATEGORY_ORDER.slice(0, index)
      .reverse()
      .map(getIngredientCategoryId)
      .find((slug) => slug !== undefined && has(slug));
    result.splice(previous ? result.findIndex((a) => a.id === previous) + 1 : 0, 0, aisle);
  });
  for (const category of customCategories) {
    if (!has(category.id)) result.push(customAisle(category));
  }
  return result;
}

export function moveShoppingAisle<T>(order: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return [...order];
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function shoppingAisleOrderPayload(
  order: readonly ShoppingAisle[],
  customCategories: readonly CustomShoppingCategory[],
): string[] | null {
  const defaults = defaultShoppingAisles(customCategories);
  const isDefault = order.length === defaults.length && order.every((aisle, index) => aisle.id === defaults[index].id);
  return isDefault ? null : order.map((aisle) => aisle.id);
}
