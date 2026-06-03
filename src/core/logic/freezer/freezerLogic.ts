import { FreezerBag, FreezerCategory, Food } from '../../domain/types';
import { isBatchCookable } from '../../domain/recipePredicates';
import { typedRecipesDb } from '../../typed-db/typedRecipesDb';
import { typedFoodDb } from '../../typed-db/typedFoodDb';

const ALL_FOODS = Object.values(typedFoodDb as Record<string, Food>);

export interface BatchRecipeResult {
  id: string;
  name: string;
  isBatch: boolean;
}

export function searchBatchRecipes(query: string): BatchRecipeResult[] {
  const q = query.toLowerCase().trim();
  return Object.entries(typedRecipesDb)
    .filter(([, r]) => r.assets?.mealPhoto && (!q || r.name.toLowerCase().includes(q)))
    .sort(([, a], [, b]) => {
      const aBatch = isBatchCookable(a);
      const bBatch = isBatchCookable(b);
      if (aBatch && !bBatch) return -1;
      if (!aBatch && bBatch) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 30)
    .map(([id, r]) => ({ id, name: r.name, isBatch: isBatchCookable(r) }));
}

export function searchFreezerFoods(query: string): Food[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_FOODS
    .filter(f => f.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);
}

export function getBatchRecipeIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  const set = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'batch' && item.portions > 0) {
        set.add(item.recipeId);
      }
    }
  }
  return set;
}

export function getFoodIdsInFreezer(categories: FreezerCategory[]): Set<string> {
  const set = new Set<string>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const total = item.bags.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
        if (total > 0) set.add(item.foodId);
      }
    }
  }
  return set;
}

export function getFoodBagsInFreezer(categories: FreezerCategory[]): Map<string, FreezerBag[]> {
  const map = new Map<string, FreezerBag[]>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const existing = map.get(item.foodId) ?? [];
        for (const bag of item.bags) {
          if ((Number(bag.quantity) || 0) > 0) existing.push(bag);
        }
        if (existing.length > 0) map.set(item.foodId, existing);
      }
    }
  }
  return map;
}

export function computeFreezerBagSelection(
  current: string[],
  bagId: string,
  allBags: FreezerBag[],
): { next: string[]; total: number } {
  const isSelected = current.includes(bagId);
  const next = isSelected ? current.filter(id => id !== bagId) : [...current, bagId];
  const total = next.reduce((sum, id) => {
    const bag = allBags.find(b => b.id === id);
    return sum + (Number(bag?.quantity) || 0);
  }, 0);
  return { next, total };
}

export function getFoodQuantitiesInFreezer(categories: FreezerCategory[]): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.type === 'food' && item.foodId) {
        const unitMap = map.get(item.foodId) ?? new Map<string, number>();
        for (const bag of item.bags) {
          const qty = Number(bag.quantity) || 0;
          unitMap.set(bag.unit, (unitMap.get(bag.unit) ?? 0) + qty);
        }
        if (unitMap.size > 0) map.set(item.foodId, unitMap);
      }
    }
  }
  return map;
}
