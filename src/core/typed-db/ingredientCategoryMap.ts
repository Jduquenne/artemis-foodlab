import { IngredientCategory } from "../domain/types";

const INGREDIENT_CATEGORY_ID: Record<IngredientCategory, string> = {
  [IngredientCategory.FRUIT_VEGETABLE]: "fruit-vegetable",
  [IngredientCategory.DRIED_FRUIT]: "dried-fruit",
  [IngredientCategory.MEAT]: "meat",
  [IngredientCategory.CONDIMENT]: "condiment",
  [IngredientCategory.SPICE]: "spice",
  [IngredientCategory.AROMATIC_HERB]: "aromatic-herb",
  [IngredientCategory.SWEET_GROCERY]: "sweet-grocery",
  [IngredientCategory.BAKERY]: "bakery",
  [IngredientCategory.RECIPE]: "recipe",
  [IngredientCategory.DAIRY]: "dairy",
  [IngredientCategory.FARM]: "farm",
  [IngredientCategory.STARCH]: "starch",
  [IngredientCategory.DELI]: "deli",
  [IngredientCategory.CANNED]: "canned",
  [IngredientCategory.FISH]: "fish",
  [IngredientCategory.NON_PURCHASE]: "non-purchase",
  [IngredientCategory.FROZEN]: "frozen",
  [IngredientCategory.INTERNET]: "internet",
  [IngredientCategory.UNKNOWN]: "unknown",
};

export function getIngredientCategoryId(category: IngredientCategory): string | undefined {
  return INGREDIENT_CATEGORY_ID[category];
}
