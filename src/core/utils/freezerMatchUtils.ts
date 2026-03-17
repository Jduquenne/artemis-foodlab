import { FreezerBag, FreezerCategory } from '../domain/types';

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
