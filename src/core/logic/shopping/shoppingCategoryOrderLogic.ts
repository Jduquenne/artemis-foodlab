import { IngredientCategory } from "../../domain/ingredient";
import { getIngredientCategoryFromSlug, getIngredientCategoryId } from "../../domain/ingredientCategorySlugs";

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

export function resolveShoppingCategoryOrder(saved: readonly string[] | null | undefined): IngredientCategory[] {
  if (!saved) return [...DEFAULT_SHOPPING_CATEGORY_ORDER];
  const result: IngredientCategory[] = [];
  for (const slug of saved) {
    const category = getIngredientCategoryFromSlug(slug);
    if (category && DEFAULT_SHOPPING_CATEGORY_ORDER.includes(category) && !result.includes(category)) result.push(category);
  }
  DEFAULT_SHOPPING_CATEGORY_ORDER.forEach((category, index) => {
    if (result.includes(category)) return;
    const previous = DEFAULT_SHOPPING_CATEGORY_ORDER.slice(0, index).reverse().find((c) => result.includes(c));
    result.splice(previous ? result.indexOf(previous) + 1 : 0, 0, category);
  });
  return result;
}

export function toShoppingCategoryOrderSlugs(order: readonly IngredientCategory[]): string[] {
  return order.map(getIngredientCategoryId).filter((slug): slug is string => Boolean(slug));
}

export function isDefaultShoppingCategoryOrder(order: readonly IngredientCategory[]): boolean {
  return (
    order.length === DEFAULT_SHOPPING_CATEGORY_ORDER.length &&
    order.every((category, index) => category === DEFAULT_SHOPPING_CATEGORY_ORDER[index])
  );
}
