import { RecipeIngredient, IngredientCategory } from "../domain/types";

export interface ConsolidatedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory;
  checked: boolean;
}

export const consolidateIngredients = (
  ingredients: RecipeIngredient[],
): ConsolidatedIngredient[] => {
  const map = new Map<string, ConsolidatedIngredient>();

  ingredients.forEach((item) => {
    // Clé unique basée sur le nom et l'unité pour éviter d'additionner des "g" et des "L"
    const key = `${item.ingredientId}-${item.unit}`;
    const existing = map.get(key);

    if (existing) {
      existing.totalQuantity += item.quantity;
    } else {
      map.set(key, {
        name: item.ingredientId, // On utilisera le nom réel via un lookup plus tard
        totalQuantity: item.quantity,
        unit: item.unit,
        category: IngredientCategory.DRY, // Par défaut
        checked: false,
      });
    }
  });

  return Array.from(map.values());
};
