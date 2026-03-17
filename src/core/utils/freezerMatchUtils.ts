import { FreezerCategory } from '../domain/types';

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
