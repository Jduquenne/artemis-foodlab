import { BatchFreezerItem, FoodFreezerItem, FreezerCategory } from "../../domain/freezer";
import { isBatchItem, isFoodItem } from "../../domain/freezerPredicates";
import { isRemovedIngredient } from "../../domain/ingredientPredicates";
import { MealSlot } from "../../domain/planning";
import { RecipeDetails } from "../../domain/recipe";
import { formatBatchQuantity } from "./batchQuantityLogic";
import { getFoodBagsSummary } from "./freezerStockLogic";

export type ThawReminder =
  | { kind: "batch"; key: string; name: string; amount: string; recipeNames: string[] }
  | { kind: "food"; key: string; name: string; amount: string; recipeNames: string[] };

function collectFoodIds(recipe: RecipeDetails, recipes: Record<string, RecipeDetails>, visited: Set<string>, found: Set<string>): void {
  if (visited.has(recipe.code)) return;
  visited.add(recipe.code);
  for (const ingredient of recipe.ingredients) {
    if (ingredient.link === "food" && !isRemovedIngredient(ingredient)) found.add(ingredient.foodId);
    const base = ingredient.link === "base" ? recipes[ingredient.baseId] : undefined;
    if (base) collectFoodIds(base, recipes, visited, found);
  }
}

export function thawReminders(slots: readonly MealSlot[], recipes: Record<string, RecipeDetails>, categories: readonly FreezerCategory[]): ThawReminder[] {
  const items = categories.flatMap((category) => category.items);
  const batches = new Map(items.filter(isBatchItem).map((item): [string, BatchFreezerItem] => [item.id, item]));
  const foods = items.filter(isFoodItem).filter((item): item is FoodFreezerItem & { foodId: string } => !!item.foodId && item.bags.length > 0);
  const batchReminders = new Map<string, Extract<ThawReminder, { kind: "batch" }>>();
  const foodRecipes = new Map<string, Set<string>>();

  for (const slot of slots) {
    for (const code of [...slot.recipeIds, ...(slot.dessertIds ?? [])]) {
      const recipe = recipes[code];
      if (!recipe) continue;
      for (const choice of slot.baseVersionChoices?.[code] ?? []) {
        if (choice.version !== "frozen") continue;
        const batch = batches.get(choice.freezerItemId);
        if (!batch) continue;
        const existing = batchReminders.get(batch.id);
        if (existing) existing.recipeNames.push(recipe.name);
        else batchReminders.set(batch.id, { kind: "batch", key: `batch-${batch.id}`, name: batch.recipeName, amount: formatBatchQuantity(batch.unit, choice.quantity), recipeNames: [recipe.name] });
      }
      const foodIds = new Set<string>();
      collectFoodIds(recipe, recipes, new Set(), foodIds);
      for (const foodId of foodIds) {
        const names = foodRecipes.get(foodId) ?? new Set<string>();
        names.add(recipe.name);
        foodRecipes.set(foodId, names);
      }
    }
  }

  const foodReminders: ThawReminder[] = foods
    .filter((item) => foodRecipes.has(item.foodId))
    .map((item) => ({ kind: "food", key: `food-${item.id}`, name: item.name, amount: getFoodBagsSummary(item), recipeNames: [...(foodRecipes.get(item.foodId) ?? [])] }));
  return [...batchReminders.values(), ...foodReminders];
}
